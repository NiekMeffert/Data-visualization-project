# -*- coding: utf-8 -*-
"""
Created on Tue Dec  5 14:02:24 2023

@author: kagecomputer 2
"""

import os




def clean_text(text):
    text = t.read()
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




   # set path
cwd = os.getcwd()
path = cwd+'\\data\\text-en_clean\\'
    
# get list of documents in path
l = os.listdir(path)

for i in range(1):
    file = path+l[i]
    print(file)
    t = open(file, encoding='UTF-8')
    words = clean_text(t)
    f = count_frequencies(words)



'''
format for frequencies dict

{[{file:'FILENAME',
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

# Following an online guide
import nltk
from nltk import word_tokenize
from nltk.probability import FreqDist
import urllib.request
from matplotlib import pyplot as plt
nltk.download('punkt')

text = t.read()

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

#tokenize text by words
words = word_tokenize(text)

#check the number of words
print(f"The total number of words in the text is {len(words)}")
