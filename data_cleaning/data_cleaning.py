# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

import pandas as pd
import os
import numpy as np
import math
import json

from geopy.geocoders import GoogleV3
from geopy.geocoders import Nominatim
from geopy.geocoders import Bing

# Set working directory
absolute_path = 'Dokumenter/GitHub/Data-visualization-project/data_cleaning'
os.chdir(absolute_path)

cwd = os.getcwd()
print('Current Working Directory is: ', cwd)

# Import data set using pandas
metadata = pd.read_csv("data/testimonies-en.csv", sep="\t", na_values="unknown")

# DATA WRANGLING AND INSPECTION
metadata.value_counts()

metadata.info()

# remove all female entries row
metadata.loc[metadata['Camps'].str.contains('female') == True]  
metadata.loc[metadata['Place_of_birth'] == 'female']
metadata.drop(236, inplace = True)

# Inspecting the cleaning the gender column
print(metadata['Gender'].unique())
print(sum(metadata['Gender'].isna()))
''' As the person with the NA has the occupation 'housewife', it is fair to conclude that the person is a female. I will thus correct the gender. '''
metadata.loc[metadata['Gender'].isna()==True] = 'female'
print(sum(metadata['Gender'].isna())) # Check that the NA was corrected


# Inspecting the place_of_birth column
print('Number of unique values: '+str(metadata['Place_of_birth'].nunique()))
print(f"Number of NAs: {sum(metadata['Place_of_birth'].isna())}")
#print(metadata['Place_of_birth'].unique())


# Inspecting the place_of_residence column
print('Place_of_residence')
print(f"Number of unique values: {(metadata['Place_of_residence'].nunique())}")
print(f"Number of NAs: {sum(metadata['Place_of_residence'].isna())}")
#metadata['Place_of_residence'].unique()


# Inspecting and cleaning the year of birth column
print('Year_of_birth')
print(f"Number of unique values: {(metadata['Year_of_birth'].nunique())}")
print(f"Number of NAs: {sum(metadata['Year_of_birth'].isna())}")
print(f"Number og 19#9: {sum(metadata['Year_of_birth']=='19#9')}")
print(f"Number og 19#5: {sum(metadata['Year_of_birth']=='19#5')}")
print(f"Number og 192#: {sum(metadata['Year_of_birth']=='192#')}")
metadata['Year_of_birth'].unique()
''' I look at the Year_of_birth column. Here I see that we have 5 NAs. But we also have 4 unreadable values. I will correct these into NAs with the exception of 192# as this might be useable depending on how I am going to proces my data. '''
metadata.loc[metadata['Year_of_birth'] == '19#9'] = np.nan
metadata.loc[metadata['Year_of_birth'] == '19#5'] = np.nan

print(f"Number of NAs: {sum(metadata['Year_of_birth'].isna())}")


# Inspecting the occupation column
print('Occupation')
print(f"Number of unique values: {(metadata['Occupation'].nunique())}")
print(f"Number of NAs: {sum(metadata['Occupation'].isna())}")
print(metadata['Occupation'].nunique())
#metadata['Occupation'].unique()


# Inspectiong the camps column
print('Camps')
print(f"Number of unique values: {(metadata['Camps'].nunique())}")
print(f"Number of NAs: {sum(metadata['Camps'].isna())}")
#print(metadata['Camps'].unique())


spl = lambda x: x.split(', ') # make lambda function
metadata['Camps2'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping
l = list(range(len(metadata)))
metadata.index = l # Correct indexes so no numbers are missing

print(f"Number of NAs: {sum(metadata['Camps'].isna())}")

# Make dictionary which counts all the values for the camps
d = {}
for i in metadata[metadata['Camps'].isna() == False]['Camps2'].index:
    for j in range(len(metadata['Camps2'][i])):
        if metadata['Camps2'][i][j] in d.keys():
            d[metadata['Camps2'][i][j]] += 1
        else:
            d[metadata['Camps2'][i][j]] = 1
            

'''
# Make copy of dictionary with no 1 value entries
d2 = d.copy()
del_list = []
for k, v in d2.items():
    if v == 1:
        del_list.append(k)
        
for item in del_list:
    del d2[item]
print('\n Dictionary d')
print(f'Length of d2: {len(d2)}')
print(f'Length of d: {len(d)}')
print(f'Sum of values for d: {sum(d.values())}')
print(f'Sum of values for d2: {sum(d2.values())}')
'''

# Ghettos changing errors in data
''' I've inspected the data frame in the variable explorer and found that there are some misspellings. I want to correct these. To locate and inspect the data I've used the variable explorer '''

# Locating wrong data for camps
# metadata.loc[metadata['Camps'].str.contains('Auscwitz') == True]
# metadata.loc[metadata['Camps'].str.contains('Aushwitz') == True]
# metadata.loc[452,'Camps']
# metadata.loc[metadata['Camps'].str.contains('Bergen Belsen') == True]

#metadata.loc[188,'Camps'] = "Birkenau, Auschwitz, Oranienburg, Flossenburg, Regensburg, Muttering"
#metadata.loc[452,'Camps'] = "Auschwitz, Birkenau, Stutthof, Magdeburg"

#l = [196, 268, 481]
#for i in l:
#    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Bergen Belsen', 'Bergen - Belsen')
        
l = metadata.loc[metadata['Camps'].str.contains('Bergenbelsen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Bergenbelsen', 'Bergen-Belsen')
    
l = metadata.loc[metadata['Camps'].str.contains('Franfurt') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Franfurt', 'Frankfurt')
    
l = metadata.loc[metadata['Camps'].str.contains('Gunskircen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Gunskircen', 'Gunskirchen')

l = metadata.loc[metadata['Camps'].str.contains('Görlicz') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Görlicz', ' Görlitz')

l = metadata.loc[metadata['Camps'].str.contains('Günskirchen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Günskirchen', 'Gunskirchen')

l = metadata.loc[metadata['Camps'].str.contains('Günskirhcen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Günskirhcen', 'Gunskirchen')

l = metadata.loc[metadata['Camps'].str.contains('Lipstadt') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Lipstadt', 'Lippstadt')

l = metadata.loc[metadata['Camps'].str.contains('Malchov') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Malchov', 'Malchow')

l = metadata.loc[metadata['Camps'].str.contains('Mauthasusen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Mauthasusen', ' Mauthausen')

l = metadata.loc[metadata['Camps'].str.contains('Mauthasuen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Mauthasuen', ' Mauthausen')

l = metadata.loc[metadata['Camps'].str.contains('Ordruf') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Ordruf', ' Ohrdruf')

l = metadata.loc[metadata['Camps'].str.contains('Ordsruf') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Ordsruf', ' Ohrdruf')

l = metadata.loc[metadata['Camps'].str.contains('Orianenburg') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Orianenburg', ' Oranienburg')

l = metadata.loc[metadata['Camps'].str.contains('Rawensbrück') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Rawensbrück', 'Ravensbrück')

l = metadata.loc[metadata['Camps'].str.contains('Reinchenbach') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Reinchenbach', ' Reichenbach')

l = metadata.loc[metadata['Camps'].str.contains('Sachsenhaus') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Sachsenhaus', ' Sachsenhausen')

l = metadata.loc[metadata['Camps'].str.contains('Saxenhausen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Saxenhausen', ' Sachsenhausen')


# Salzwedel
l = metadata.loc[metadata['Camps'].str.contains('Slaczwedel') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Slaczwedel', ' Salzwedel')

l = metadata.loc[metadata['Camps'].str.contains('Slazwedel') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Slazwedel', ' Salzwedel')

l = metadata.loc[metadata['Camps'].str.contains('Salzwedell') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Salzwedell', ' Salzwedel')

l = metadata.loc[metadata['Camps'].str.contains('Salzwedell Belsenberg') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Salzwedell Belsenberg', ' Salzwedel, Belsenberg')


# Stutthof
l = metadata.loc[metadata['Camps'].str.contains('Stuthof') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Stuthof', ' Stutthof')

l = metadata.loc[metadata['Camps'].str.contains('Studhof') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Studhof', 'Stutthof')


# Theresienstadt
l = metadata.loc[metadata['Camps'].str.contains('Thereienstadt') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Theresienstedt', ' Theresienstadt')

l = metadata.loc[metadata['Camps'].str.contains('Studhof') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Theresiestadt', 'Theresienstadt')



# Doing this a smarter way
l1 = ['Sachsenhausenen', 'Salzwedel Belsenberg', 'Auschwitz - Birkenau', 'Auschwitz - Marklinberg', 'Auschwitz - Torgau','Brauschweig', 'Bushenwald', 'Fallerslebel', 'Fallensleben', 'Fallesleben', 'Farsleben', 'Gelsehkirchen','Grosrosen', 'Görlicz','Kaufernig','Markkleberg','Mathausen','Mihldorf','Mosowitz','Mühldorf Waldlager','Münldorf','Neugam','Neugame','Neugamen','Neugami','Neungamen','Parschwitz'] # Wrong names
l2 = ['Sachsenhausen', 'Salzwedel, Belsenberg', 'Auschwitz', 'Auschwitz, Marklinberg', 'Auschwitz, Torgau', 'Braunschweig', 'Buchenwald', 'Fallersleben', 'Fallersleben', 'Fallersleben', 'Fallersleben', 'Gelsenkirchen','Grossrosen', 'Görlitz', 'Kaufering','Markkleeberg','Mauthausen','Mildorf','Monowitz','Mühldorf','Mühldorf','Neuengamme','Neuengamme','Neuengamme','Neuengamme','Neuengamme','Parschnitz'] # Correct names

for i in range(len(l1)):
    l = metadata.loc[metadata['Camps'].str.contains(l1[i]) == True].index
    print(l1[i],',',l2[i])
    for j in l:
        metadata.loc[j,'Camps'] = metadata.loc[j,'Camps'].replace(l1[i], l2[i])



# Create dictionary again
spl = lambda x: x.split(', ') # make lambda function
metadata['Camps2'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping
l = list(range(len(metadata)))
metadata.index = l # Correct indexes so no numbers are missing

d = {}
for i in metadata[metadata['Camps'].isna() == False]['Camps2'].index:
    for j in range(len(metadata['Camps2'][i])):
        if metadata['Camps2'][i][j] in d.keys():
            d[metadata['Camps2'][i][j]] += 1
        else:
            d[metadata['Camps2'][i][j]] = 1
 
            
 
# Making another run of this

# wrong names
l1 = ['Auscwitz', 'Aushwitz', 'Bergaelster','Berga am Elster', 'Bergen Belsen', 'Bergen - Belsen', 'Bireknau', 'Birkenbau', 'Dora (Nordhausen)','Grossrosen']

# correct names
l2 = ['Auschwitz', 'Auschwitz', 'Berga-Elster', 'Berga-Elster','Bergen-Belsen','Bergen-Belsen', 'Auschwitz', 'Auschwitz', 'Dora', 'Gross-Rosen']

for i in range(len(l1)):
    l = metadata.loc[metadata['Camps'].str.contains(l1[i]) == True].index
    print(l1[i],',',l2[i])
    for j in l:
        metadata.loc[j,'Camps'] = metadata.loc[j,'Camps'].replace(l1[i], l2[i])
        

# Create dictionary again
spl = lambda x: x.split(', ') # make lambda function
metadata['Camps2'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping
l = list(range(len(metadata)))
metadata.index = l # Correct indexes so no numbers are missing

d = {}
for i in metadata[metadata['Camps'].isna() == False]['Camps2'].index:
    for j in range(len(metadata['Camps2'][i])):
        if metadata['Camps2'][i][j] in d.keys():
            d[metadata['Camps2'][i][j]] += 1
        else:
            d[metadata['Camps2'][i][j]] = 1
 
    



# Make dict with camps and subcamps
camps_subcamps = {'Buchenwald':['Berga-Elster'],'Auschwitz':[], 'Gross-Rosen': ['Fünfteichen']}


# Place of birth
c = metadata['Place_of_birth'].count

metadata.loc[metadata['Place_of_birth'] == 'Alsóapsó','Place_of_birth'] = 'Alsóapsa'

l1 = ['Alsóapsó','Badalo', 'Gyor','Técs?', 'Érsekujvár', 'Perecsény', 'Budapesten', 'Budapst', 'Budafok', 'Alsószinever'] # Wrong names
l2 = ['Alsóapsa','Badaló', 'Györ','Técso', 'Érsekújvár', 'Perecseny', 'Budapest', 'Budapest', 'Budapest', 'Alsószinevér'] # Correct names
for i in range(len(l1)):
     metadata.loc[metadata['Place_of_birth'] == l1[i],'Place_of_birth'] = l2[i]

d_birth = {}
for i in range(len(metadata)):
    if metadata.loc[i,'Place_of_birth'] in d_birth.keys():
        d_birth[metadata.loc[i,'Place_of_birth']] += 1
    else:
        d_birth[metadata.loc[i,'Place_of_birth']] = 1



# Place of residence
for i in range(len(l1)): # Reuse lists from birth place
     metadata.loc[metadata['Place_of_residence'] == l1[i],'Place_of_residence'] = l2[i]


# make new lists
l1 = ['Keselymez?'] # Wrong names
l2 = ['Keselymezo'] # Correct names

d_residence = {}
for i in range(len(metadata)):
    if metadata.loc[i,'Place_of_residence'] in d_residence.keys():
        d_residence[metadata.loc[i,'Place_of_residence']] += 1
    else:
        d_residence[metadata.loc[i,'Place_of_residence']] = 1


# FIND GEOLOCATIONS
# Load API key from Google Maps API
with open('api_key.txt') as f:
    api_key = f.readline()
    f.close
    
geolocator_google = GoogleV3(api_key=api_key,)
geolocator = Nominatim(user_agent="my_geocoder")




birth_places = metadata['Place_of_birth'].unique()
birth_places = birth_places[~pd.isnull(birth_places)]

residences = metadata['Place_of_residence'].unique()
residences = residences[~pd.isnull(residences)]




# make list of place names
places = []
for i in range(len(birth_places)):
    places.append(birth_places[i])
print(len(places))
for i in range(len(residences)):
    if residences[i] not in places:
        places.append(residences[i])
print(len(places))
print(len(d))
for key, value in d.items():
    if key not in places:
        places.append(key)
print(len(places))


# Geocode place names
'''
geo_dict = {}
c = 0

for i in range(len(places)):
    location = geolocator.geocode(str(places[i]))
    if location is not None:
        geo_dict[places[i]] = [location.longitude,location.latitude]
        print(geo_dict[places[i]])
    else:
        location = geolocator_google.geocode(str(places[i]))
        if location is not None:
            geo_dict[places[i]] = [location.longitude,location.latitude]
            print(geo_dict[places[i]])
        else:
            c += 1

print(geo_dict)
print(c)
'''


geo_dict = {}
errors = []
c = 0

for i in range(len(places)):
    location = geolocator_google.geocode(str(places[i]),components=[('country','Hungary'),('country','Germany'),('country','Poland'),('country','Ukraine'),('country','Switzerland'),('country','Austria'),('country','Czechia'), ('country','Liechtenstein'),('country','Slovakia'),('country','Romania'),('country','Belarus')])
    if location is not None:
        geo_dict[places[i]] = [location.longitude,location.latitude]
       # print(geo_dict[places[i]])
    else:
        errors.append(str(places[i]))
        print("ERROR")
        c += 1

print(geo_dict)
print(c)
print(errors)

for i in range(len(errors)):
    location = geolocator_google.geocode(components={"city": str(errors[i])}, exactly_one=False)
    print(location)


'''
## Put into dataframe
for key, value in birth_geo_dict.items():
   # print(key)
    #print(value[0])
    l = metadata.loc[metadata['Place_of_birth'] == key].index
    for i in (l):
           metadata.loc[i,'Birth_latitude'] = value[0]
           metadata.loc[i,'Birth_longitude'] = value[1]

'''







# GEOJSON file format
'''
{
 'type': 'FeatureCollection',
 "features": [
     {"type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates":
              [latitude,longitude]
          },
          "properties": {
              "Place_name": "Budapest"
              }
      }
     ] 
 }
'''
geo = {'type': 'FeatureCollection',
       "features":[]}

for key, value in geo_dict.items():
    if key == 'nan':
        pass
    geo['features'].append({
        'type':'feature',
        'geometry':{
            'type':'Point',
            'coordinates':[value[0],value[1]],
            },
        'properties': {'Place_name':key}})



# SAVE CLEANED DATA AS JSON FILE
cwd = os.getcwd()
save_path = cwd+'\\data\\clean_data2.json'
metadata.to_json(orient='split',path_or_buf =  save_path)

# Save dict d
with open('data/dict.json','w', encoding='UTF-8') as fp:
    json.dump(d, fp)
    
fp.close()

with open('data/residence_short3.json','w', encoding='UTF-8') as fp:
    json.dump(geo,fp)
fp.close()