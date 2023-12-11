import json
from collections import Counter

# Load the JSON file
with open('clean_data2.json', 'r') as file:
    data = json.load(file)

# Extract data from the "Camps" and "Camps2" columns
camps_data = [entry["Camps"] + entry["Camps2"] for entry in data if "Camps" in entry and "Camps2" in entry]

# Flatten the list of lists into a single list
all_camps = [camp for sublist in camps_data for camp in sublist]

# Count occurrences of each camp
camp_counts = Counter(all_camps)

# Convert the Counter to a dictionary
result = dict(camp_counts)

# Print the result
print(result)

# Save the result as a JSON file
with open('camp_counts.json', 'w') as json_file:
    json.dump(result, json_file)