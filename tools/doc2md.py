#!/usr/bin/env python3
"""Converte a leitura de um Claude Doc em Markdown (a leitura grande é salva pela ferramenta em um arquivo cuja 1ª linha é o JSON {"data":{"rev","xml"}}).
Uso: python3 tools/doc2md.py <arquivo-salvo> > /tmp/plano.md ; depois acrescente a linha de aviso do topo de plan/PLANO-MESTRE.md."""
import json, sys, re
import xml.etree.ElementTree as ET

def txt(el):
    """texto corrido de um elemento, com **negrito**"""
    out = []
    if el.text and el.tag not in ('table',):
        out.append(el.text)
    for c in el:
        if c.tag == 'bold':
            out.append('**' + txt(c) + '**')
        elif c.tag == 'italic':
            out.append('*' + txt(c) + '*')
        elif c.tag == 'code':
            out.append('`' + txt(c) + '`')
        elif c.tag in ('text', 'link'):
            out.append(txt(c))
        elif c.tag == 'date':
            out.append(c.get('value', ''))
        elif c.tag == 'mention':
            out.append('@' + (c.get('name') or ''))
        else:
            out.append(txt(c))
        if c.tail:
            out.append(c.tail)
    return ''.join(out)

def para(p):
    return re.sub(r'\s+', ' ', txt(p)).strip()

def block(el, depth=0, lines=None):
    lines = [] if lines is None else lines
    for c in el:
        if c.tag == 'paragraph':
            h = c.get('heading')
            t = para(c)
            if h:
                lines.append('#' * int(h) + ' ' + t); lines.append('')
            elif t:
                lines.append(t); lines.append('')
        elif c.tag == 'list':
            ordered = c.get('kind') == 'ordered'
            for i, li in enumerate(c, 1):
                inner = [x for x in li if x.tag == 'paragraph']
                first = para(inner[0]) if inner else ''
                mark = f'{i}.' if ordered else '-'
                lines.append('  ' * depth + f'{mark} {first}')
                for sub in li:
                    if sub.tag == 'list':
                        block(ET.Element('x', {}) if False else _wrap(sub), depth + 1, lines)
            lines.append('')
        elif c.tag == 'table':
            rows = []
            for r in c.iter('row'):
                rows.append([para(cell).replace('|', '/') if cell.find('paragraph') is None else ' '.join(para(p) for p in cell.iter('paragraph')).replace('|', '/') for cell in r if cell.tag == 'cell'])
            if rows:
                w = max(len(r) for r in rows)
                rows = [r + [''] * (w - len(r)) for r in rows]
                lines.append('| ' + ' | '.join(rows[0]) + ' |')
                lines.append('|' + '---|' * w)
                for r in rows[1:]:
                    lines.append('| ' + ' | '.join(r) + ' |')
                lines.append('')
        elif c.tag == 'code':
            lines.append('```'); lines.append(txt(c)); lines.append('```'); lines.append('')
        elif c.tag == 'embed':
            lines.append('[embed: ' + (c.get('src') or c.get('kind') or 'incorporado') + ']'); lines.append('')
    return lines

def _wrap(sub):
    w = ET.Element('w'); w.append(sub); return w

d = json.loads(open(sys.argv[1]).readline())
xml = d['data']['xml']
root = ET.fromstring(xml)
print('\n'.join(block(root)))
