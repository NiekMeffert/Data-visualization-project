# -*- coding: utf-8 -*-
"""
Created on Thu Dec 14 10:46:21 2023

@author: kagecomputer 2
"""

import pandas as pd
import os
import thefuzz
import numpy as np
from thefuzz import process
from collections import Counter
import json

# Function to find best match main camps
def find_best_match_main(names):
    matches = []
    if names == 0.:
        return []
    for name in names:
        if name == 0:
            continue
        match, score = process.extractOne(name, main_camps)
        if score > 90:
            # print(score, name, match)
            matches.append(match)
    
    return matches

# Function to find best match sub camps
def find_best_match_sub(names):
    matches = []
    if names == 0.:
        return []
    for name in names:
        if name == 0:
            continue
        match, score = process.extractOne(name, subcamps)
        if score > 90:
            # print(score, name, match)
            matches.append(match)
    
    return matches


# Set paths
# Set working directory and paths
cwd = os.getcwd()
print('Working directiory is: '+cwd)
p = os.path.join(cwd,'data')
path_shape = os.path.join(p,'SS_Camps_Definitive.csv')
path_df = os.path.join(p,'clean_data2.json')
print(path_df)



# Import OG dataframe
metadata = pd.read_csv("data/testimonies-en.csv", sep="\t")


# Import database from shape file
shape_df = pd.read_csv(path_shape)

# Find main camps
main_camps = shape_df['MAIN'].unique()

# Find subcamps
subcamps = shape_df['SUBCAMP'].unique()



# Make Camps_list column
spl = lambda x: x.split(', ') # make lambda function
metadata['Camps_list'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping


'''
for index,row in metadata.iterrows():
    print(index)
    if row['Camps_list'] == 0:
        continue
    else:
        for i in range(len(row['Camps_list'])):
            print(row['Camps_list'][i])
            m = print(find_best_match(row['Camps_list'][i]))

new_array = []

for index, row in metadata.iterrows():
    for entry in row['Best_Match']:
        new_row = row.copy()
        new_row["single_match"] = entry
        new_array.append(new_row)
'''

'''
Before the next part I have run the best_match_functions and inspected the results to find place names that needed to be corrected
'''

# Change a subcamp name
#shape_df.loc[682,'SUBCAMP'] = 'Gunskirchen'

# Correct some place names
l_wrong = ['Günskirchen', 'Günskirhcen']
l_correct = []
for i in range(len(l_wrong)):
    l_correct.append('Gunskirchen')

for i in range(len(l_wrong)):
    l = metadata.loc[metadata['Camps'].str.contains(l_wrong[i]) == True].index
    print(l_wrong[i],',',l_correct[i])
    for j in l:
        metadata.loc[j,'Camps'] = metadata.loc[j,'Camps'].replace(l_wrong[i], l_correct[i])




l_wrong = ['Ohrdruff', 'Berga-Elster','Neugame', 'Birkenau','Auschwitz - Torgau', 'Kaufering', 'Gunskirchen', 'Kratzau', 'Kaufernig' ]
l_correct = ['Ohrdruff ("SIII")','Berga-Elster ("Schwalbe V")', 'Neuengamme', 'Auschwitz II Birkenau', 'Auschwitz, Torgau', 'Kaufering I', 'Gunskirchen-Wels [aka Waldwerke Wels Notbehelfsheimbau SS-Arbeitslager Gunskirchen]', 'Kratzua II', 'Kaufering I']

for i in range(len(l_wrong)):
    l = metadata.loc[metadata['Camps'].str.contains(l_wrong[i]) == True].index
    print(l_wrong[i],',',l_correct[i])
    for j in l:
        metadata.loc[j,'Camps'] = metadata.loc[j,'Camps'].replace(l_wrong[i], l_correct[i])





# Make Camps_list column again
spl = lambda x: x.split(', ') # make lambda function
metadata['Camps_list'] = metadata['Camps'].map(spl, na_action='ignore') # Use mapping

metadata['Camps_list'] = metadata['Camps_list'].fillna(0)


# Use best_match_function
metadata['main_Camps'] = metadata['Camps_list'].apply(find_best_match_main)
metadata['subcamps'] = metadata['Camps_list'].apply(find_best_match_sub)



# Find main camps based on subcamps

## Find unique subcamps
unique_subcamps = []

for i in metadata[metadata['Camps'].isna() == False]['Camps_list'].index:
    for j in range(len(metadata['subcamps'][i])):
        if metadata['subcamps'][i][j] in unique_subcamps:
            continue
        else:
            unique_subcamps.append(metadata['subcamps'][i][j])

# Make dict of relation between subcamp and maincamp?
#shape_df.loc[shape_df['SUBCAMP'] == sc]['MAIN']

## Add main camps based on subcamps
for index, row in metadata.iterrows():
    for camp in row['subcamps']:
        main = shape_df.loc[shape_df['SUBCAMP'] == camp]['MAIN']
        if len(main) != 1:
            continue
        mc = main.item()
        if mc in row['main_Camps']:
            continue
        else:
            new_row = row.copy()
            new_row['main_Camps'].append(mc)
            




# Make dictionary which counts all the values for the camps
d = {}
for i in metadata[metadata['Camps'].isna() == False]['Camps_list'].index:
    for j in range(len(metadata['Camps_list'][i])):
        if metadata['Camps_list'][i][j] in d.keys():
            d[metadata['Camps_list'][i][j]] += 1
        else:
            d[metadata['Camps_list'][i][j]] = 1
            
d_counted = Counter(d)
print('Top 10 camps: \n'+str(d_counted.most_common(10)))


# Make dictionary which counts all the values for the subcamps
d_sub = {}
for i in metadata[metadata['Camps'].isna() == False]['subcamps'].index:
    for j in range(len(metadata['subcamps'][i])):
        if metadata['subcamps'][i][j] in d_sub.keys():
            d_sub[metadata['subcamps'][i][j]] += 1
        else:
            d_sub[metadata['subcamps'][i][j]] = 1
            
d_counted = Counter(d)
print('Top 10 subcamps: \n'+str(d_counted.most_common(10)))


# Make dictionary which counts all the values for the main camps
d_main = {}
for i in metadata[metadata['Camps'].isna() == False]['main_Camps'].index:
    for j in range(len(metadata['main_Camps'][i])):
        if metadata['main_Camps'][i][j] in d_main.keys():
            d_main[metadata['main_Camps'][i][j]] += 1
        else:
            d_main[metadata['main_Camps'][i][j]] = 1
            
d_counted = Counter(d_main)
print('Top 10 main camps: \n'+str(d_counted.most_common(10)))


dic = {'all':d, 'sub':d_sub, 'main':d_main
       }


# Save dic
with open('data/camp_count_all.json','w', encoding='UTF-8') as fp:
    json.dump(dic, fp)   
fp.close()