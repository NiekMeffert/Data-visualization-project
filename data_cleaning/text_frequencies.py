# -*- coding: utf-8 -*-
"""
Created on Tue Dec  5 14:02:24 2023

@author: kagecomputer 2
"""

import os


import nltk
from nltk import word_tokenize
from nltk.probability import FreqDist
import urllib.request
from matplotlib import pyplot as plt
nltk.download('punkt')
from wordcloud import WordCloud

#Download and import list of stopwords
nltk.download("stopwords")
from nltk.corpus import stopwords



def clean_text(text):
    text = text.read()
    text = text.replace(',', '')
    text = text.replace('.', ' ')
    text = text.replace(':', '')
    text = text.replace(';', '')
    text = text.lower()
    word_list = text.split()
    return word_list
    

def count_frequencies(wordlist):
    frequencies = {}
    for word in wordlist:
        if word not in frequencies.keys():
            frequencies[word] = 1
        elif word in frequencies.keys(): 
            frequencies[word] += 1
    
    return frequencies

def nltk_frequencies(text):
    # tokenize text by words
    words = word_tokenize(text)
    
    # check the number of words
    print(f"The total number of words in the text is {len(words)}")
    
    # create an empty list to store words
    words_no_punc = []
    
    #iterate through the words list to remove punctuations
    for word in words:
        if word.isalpha():
            words_no_punc.append(word.lower())
    
    #print number of words without punctuation
    print(f"The total number of words without punctuation is {len(words_no_punc)}")
    
    #list of stopwords
    stopwords_list = stopwords.words("english")
    print(stopwords_list)
    
    #create an empty list to store clean words
    clean_words = []
    
    #Iterate through the words_no_punc list and add non stopwords to the new clean_words list
    for word in words_no_punc:
        if word not in stopwords_list:
            clean_words.append(word)
    
    print(f"The total number of words without punctuation and stopwords is {len(clean_words)}")
    
    
    
    #Update the stopwords list
    stopwords_list.extend(["got","one", "day", "two"])
    
    #create an empty list to store clean words
    clean_words = []
    
    #Iterate through the words_no_punc list and add non stopwords to the new clean_words list
    for word in words_no_punc:
        if word not in stopwords_list:
            clean_words.append(word)
            
    #find the frequency of words
    fdist = FreqDist(clean_words)        
    
    return fdist


   # set path
cwd = os.getcwd()
print(cwd)
path = cwd+'\\data\\text-en_clean\\'
print(path)    
# get list of documents in path
l = os.listdir(path)
freq_dict = {'texts':[]}  

for i in range(len(l)):
    file = path+l[i]
    print(file)
    t = open(file, encoding='UTF-8')
    text = t.read()
    #words = clean_text(t)
    fdist = nltk_frequencies(text)
    # Put into JSON format
    file_name = file
    file_id = l[i]
    file_id = file_id.replace('.txt', '')
    freq_dict['texts'].append({
            'file': file_name,
            'id': file_id,
            'words': {}
            })
    for key,value in fdist.items():
        freq_dict['texts'][i]['words'].update({key:value})



'''
format for frequencies dict

{'texts':
 [{file:'FILENAME',
   id: 'ID NUMBER'
   words: {
       WORD1: FREQUENCY1,
       WORD2, FREQUENCY2,
       ...}
   },
  {file:'FILENAME',
     id: 'ID NUMBER'
     words: {
         WORD1: FREQUENCY1,
         WORD2, FREQUENCY2,
         ...}
   , 
   ...  
  ] 
 }
'''



# set path
cwd = os.getcwd()
path = cwd+'\\data\\text-en_clean\\'
    
# get list of documents in path
l = os.listdir(path)

for i in range(1):
    file_path = path+l[i]
    print(file_path)
    text_file = open(file, encoding='UTF-8')
    text = text_file.read()
    print(text)



''' Stemming words 

# importing modules
from nltk.stem import WordNetLemmatizer
 
stemmer = WordNetLemmatizer()

for w in words_no_punc:
    print(w)
    print(stemmer.lemmatize(w))


for w in words_no_punc:
    print(w, " : ", stemmer.stem(w))
'''