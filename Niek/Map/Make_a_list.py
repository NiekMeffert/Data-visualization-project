import json
from collections import Counter

# Load the JSON file
with open('clean_data2.json', 'r') as file:
    data = json.load(file)

# Extract data from the "Camps" and "Camps2" columns
camps_data = [
    camp.strip() for entry in data
    for camp_list in [entry.get("Camps", []) + entry.get("Camps2", [])]
    for camp in camp_list
]

# Count occurrences of each location
location_counts = Counter(camps_data)

# Convert the Counter to a dictionary
result = dict(location_counts)

# Print the result
print(result)

# Save the result as a JSON file
with open('location_counts.json', 'w') as json_file:
    json.dump(result, json_file)
