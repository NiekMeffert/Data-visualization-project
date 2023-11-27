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

# Set working directory
absolute_path = 'Dokumenter/GitHub/Data-visualization-project/data_cleaning'
os.chdir(absolute_path)

cwd = os.getcwd()
print('Current Working Directory is: ', cwd)

# Import data set using pandas
metadata = pd.read_csv("data/testimonies.csv", sep="\t", na_values="unknown")

# DATA WRANGLING AND INSPECTION
metadata.value_counts()

print(metadata.loc[metadata['Name']== 'S. R.'])
# I notice som duplicates so I drop them and check that it worked
metadata = metadata.drop_duplicates()

print(metadata.value_counts())



metadata.info()

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
#metadata['Year_of_birth'].unique()
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
print(metadata['Camps'].unique())


spl = lambda x: x.split(', ') # make lambda function
metadata['Camps2'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping
l = list(range(493))
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
            
del d['female'] # remove wrong value from dictionary should look into this later


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


# Ghettos changing errors in data
''' I've inspected the data frame in the variable explorer and found that there are some misspellings. I want to correct these. To locate and inspect the data I've used the variable explorer '''

# Locating wrong data for camps
# metadata.loc[metadata['Camps'].str.contains('Auscwitz') == True]
# metadata.loc[metadata['Camps'].str.contains('Aushwitz') == True]
# metadata.loc[452,'Camps']
# metadata.loc[metadata['Camps'].str.contains('Bergen Belsen') == True]

metadata.loc[188,'Camps'] = "Birkenau, Auschwitz, Oranienburg, Flossenburg, Regensburg, Muttering"
metadata.loc[452,'Camps'] = "Auschwitz, Birkenau, Stutthof, Magdeburg"

l = [196, 268, 481]
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Bergen Belsen', 'Bergen - Belsen')
        
l = metadata.loc[metadata['Camps'].str.contains('Bergenbelsen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Bergenbelsen', 'Bergen - Belsen')
    
l = metadata.loc[metadata['Camps'].str.contains('Franfurt') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Franfurt', 'Frankfurt')
    
l = metadata.loc[metadata['Camps'].str.contains('Gunskircen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Gunskircen', ' Gunskirchen')

i = metadata.loc[metadata['Camps'].str.contains('Görlicz') == True].index
metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Görlicz', ' Görlitz')

l = metadata.loc[metadata['Camps'].str.contains('Günskirchen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Günskirchen', 'Gunskirchen')

l = metadata.loc[metadata['Camps'].str.contains('Günskirhcen') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Günskirhcen', ' Gunskirchen')

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
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Thereienstadt', ' Theresienstadt')

l = metadata.loc[metadata['Camps'].str.contains('Studhof') == True].index
for i in l:
    metadata.loc[i,'Camps'] = metadata.loc[i,'Camps'].replace('Studhof', 'Theresienstadt')



# Doing this a smarter way
l1 = ['Sachsenhausenen', 'Salzwedel Belsenberg'] # Wrong names
l2 = ['Sachsenhausen', 'Salzwedel, Belsenberg'] # Correct names

for i in range(len(l1)):
    l = metadata.loc[metadata['Camps'].str.contains(l1[i]) == True].index
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
            
del d['female'] # remove wrong value from dictionary should look into this later





# SAVE CLEANED DATA AS JSON FILE
cwd = os.getcwd()
save_path = cwd+'\\data\\clean_data1.json'
metadata.to_json(orient='split',path_or_buf =  save_path)

# Save dict d
with open('data/dict.json','w', encoding='UTF-8') as fp:
    json.dump(d, fp)
    
fp.close()