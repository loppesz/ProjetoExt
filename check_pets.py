import sqlite3

conn = sqlite3.connect('instance/petadopt.db')
cur = conn.cursor()

print("=== USUÁRIOS ===")
cur.execute("SELECT id, name, email, role FROM usuario")
for row in cur.fetchall():
    print(f"ID: {row[0]}, Nome: {row[1]}, Email: {row[2]}, Role: {row[3]}")

print("\n=== PETS ===")
cur.execute("SELECT id, nome, usuario_id, mod_status, status FROM pet")
for row in cur.fetchall():
    print(f"ID: {row[0]}, Nome: {row[1]}, Usuario ID: {row[2]}, Mod Status: {row[3]}, Status: {row[4]}")

print(f"\nTotal de pets: {cur.execute('SELECT COUNT(*) FROM pet').fetchone()[0]}")
print(f"Pets pendentes: {cur.execute('SELECT COUNT(*) FROM pet WHERE mod_status=\"pending\"').fetchone()[0]}")

conn.close()
