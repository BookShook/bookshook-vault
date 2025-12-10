import csv
import json

# CONFIG
CSV_FILE = "vault.csv"
JS_OUTPUT_FILE = "gremlin-vault.js"

def parse_bool(val):
    return str(val).lower() in ['true', '1', 'yes', 'y']

def main():
    library = []
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert CSV strings to real data types for Javascript
                book = {
                    "id": row['id'],
                    "title": row['title'],
                    "author": row['author'],
                    "codename": row['codename'], # The "Secret" title for free users
                    "link": row['link'],
                    "tropes": [t.strip() for t in row['tropes'].split(';')], # Splits "Mafia; Enemies" into a list
                    "spice": int(row['spice']) if row['spice'] else 1,
                    "burn": row['burn'],
                    "harem": int(row['harem']) if row['harem'] else 1,
                    "audio": parse_bool(row['audio']),
                    "mm": parse_bool(row['mm']),
                    "ff": parse_bool(row['ff']),
                    "setting": row['setting'],
                    "shifter": row['shifter'],
                    "darkness": row['darkness'],
                    "safety": row['safety'],
                    "ratio": row['ratio'],
                    "series": row['series'],
                    "mmc": row['mmc'],
                    "fmc": row['fmc'],
                    "rating": float(row['rating']) if row['rating'] else 0.0,
                    "vibe": row['vibe'],
                    "freeUnlocked": parse_bool(row['free_week']), # This controls the "Free Gem"
                    "type": "RH" if int(row.get('harem', 1)) > 1 else "MF", # Auto-detect type based on harem count
                    "ku": True # Assuming default is KU, or add a column for it
                }
                
                # Check for explicit KU column if you added it
                if 'ku' in row:
                    book['ku'] = parse_bool(row['ku'])
                    
                # Check for explicit 'type' column if you added it (MF, RH, MM, FF)
                if 'type' in row and row['type']:
                    book['type'] = row['type']

                library.append(book)

        # Write the JS file
        with open(JS_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(f"const gLibrary = {json.dumps(library, indent=2)};")
            
        print(f"✅ Success! Processed {len(library)} books into {JS_OUTPUT_FILE}")

    except FileNotFoundError:
        print(f"❌ Error: Could not find '{CSV_FILE}'. Make sure it is in the same folder as this script.")
    except KeyError as e:
        print(f"❌ Error: Your CSV is missing a required column: {e}")

if __name__ == "__main__":
    main()