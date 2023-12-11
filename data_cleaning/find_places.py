import os
import pandas as pd
from functions import clean_text

# open data frame
cwd = os.getcwd()
path = cwd+'\\data\\clean_data2.json'

df = pd.read_json(path, orient='split')
df['Testimony_ID'] = df['Testimony_ID'].convert_dtypes(convert_boolean=False,convert_string=False,convert_integer=True,convert_floating=False)

# open texts
path = cwd+'\\data\\text-en_clean\\'
list_files = os.listdir(path)

# make list with camp_names
''' This makes a list with camp names from the data frame. It might be better to do this based on the dbf-file we found. '''
l = []
camp_list = []
for i in range(len(df['Camps2'])):
    if df['Camps2'][i] not in l:
        l.append(df['Camps2'][i])

for camp_l in l:
    if camp_l == None:
        continue
    for camp in camp_l:
        camp_list.append(camp)


c = 0
# Loop through all the data
for i in range(len(list_files)):
    # Locate the person(s) in the dataframe
    id = list_files[i].replace('.txt','')
    # find index row for said testimony
    index = df[df['Testimony_ID']==int(id)].index
    # chech that the id was found
    if index.size == 0:
        print(id+' id not found in df')
        c +=1
        continue

    # do the work
    file = path+list_files[i]
    t = open(file, encoding='UTF-8')
    text = t.read()
    t.close()
    wl = clean_text(text)
    word_list = []
    for word in wl:
        word = word.capitalize()
        word_list.append(word)
    # remove digits
    word_list = [word for word in word_list if not word.isdigit()]
    # remove duplicates
    word_list = set(word_list)


    # check for not listed camps in text
    camps_in_text = []
    for word in word_list:
        if word in camp_list:
            if word not in camps_in_text:
                camps_in_text.append(word)



    # find camps
    camps = df.loc[index,'Camps']
    camps_list_data = df.loc[index,'Camps2'].to_numpy()[0]

    camps_missing = []
    for camp in camps_in_text:
        if camps_list_data == None:
            continue
        if camp in camps_list_data:
            print(camp+' found in metadata')
            #camps_list_data.remove(camp)
        elif camp not in camps_list_data:
            print(camp+' was not found')
            camps_missing.append(camp)

    # make ready to add to dataframe
    for camp in camps_missing: 
        s = ', '+camp+' from txt'
        camps = camps+s
        camps_list_data.append(camp)

    # put into df
    df.loc[index,'Camps'] = camps
    df.loc[index,'Camps2'][0] = camps_list_data



print("Number of not found id's: "+str(c))

        
'''
for text in corpus:
    # open text
    # split text 
    # find camp names
    # find persons related to text
    # check in place_names in df.person
        # if not there append to list




for person in df:
    if testimony_id = text_id:
'''