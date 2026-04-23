content = open('database.py', 'r').read()
fixed = content.replace(
    'lat         REAL NOT NULL',
    'lat         REAL'
).replace(
    'lon         REAL NOT NULL',
    'lon         REAL'
)
open('database.py', 'w').write(fixed)
print("Done")