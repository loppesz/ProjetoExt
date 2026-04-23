from pathlib import Path
html_files = ['index.html','dashboard.html','login.html','new-pet.html','pet.html','pets.html','register.html','sobre.html']
js_dir = Path('js')
js_dir.mkdir(exist_ok=True)

for html in html_files:
    p = Path(html)
    txt = p.read_text(encoding='utf-8')
    if '<script>' not in txt or '</script>' not in txt:
        print(f'{html}: no inline script found, skipping')
        continue
    start_tag = txt.index('<script>')
    start = start_tag + len('<script>')
    end = txt.index('</script>', start)
    script_content = txt[start:end].strip() + '\n'
    if not script_content.strip():
        print(f'{html}: inline script empty, skipping')
        continue
    js_file = js_dir / (p.stem + '.js')
    js_file.write_text(script_content, encoding='utf-8')
    # Remove old script block
    new_html = txt[:start_tag] + txt[end+len('</script>'):]
    # Insert script include before closing body
    insert = f'\n<script src="js/{p.stem}.js"></script>\n'
    if '</body>' in new_html:
        new_html = new_html.replace('</body>', insert + '</body>')
    else:
        new_html += insert
    p.write_text(new_html, encoding='utf-8')
    print(f'{html}: moved script to js/{p.stem}.js')
