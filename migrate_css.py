from pathlib import Path
files = ["dashboard.html","login.html","new-pet.html","pet.html","pets.html","register.html","sobre.html"]
css_path = Path('css/petadopt.css')
if not css_path.exists():
    raise SystemExit('css file missing')

for fn in files:
    p = Path(fn)
    txt = p.read_text(encoding='utf-8')
    if '<style>' not in txt:
        print(f'{fn}: no style block')
        continue
    start = txt.index('<style>') + len('<style>')
    end = txt.index('</style>')
    style = txt[start:end].strip()
    if style:
        with css_path.open('a', encoding='utf-8') as f:
            f.write(f"\n\n/* from {fn} */\n")
            f.write(style + '\n')
        print(f'{fn}: style appended')
    newtxt = txt[:txt.index('<style>')] + txt[end+len('</style>'):]
    insert = '<link rel="stylesheet" href="css/petadopt.css">\n'
    if '<link href="https://fonts.googleapis.com' in newtxt:
        pos = newtxt.index('<link href="https://fonts.googleapis.com')
        end_line = newtxt.index('>', pos) + 1
        newtxt = newtxt[:end_line] + '\n' + insert + newtxt[end_line:]
    else:
        if '<meta name="viewport"' in newtxt:
            pos = newtxt.index('<meta name="viewport"')
            end_line = newtxt.index('>', pos) + 1
            newtxt = newtxt[:end_line] + '\n' + insert + newtxt[end_line:]
    p.write_text(newtxt, encoding='utf-8')
    print(f'{fn}: html updated')
