# -*- coding: utf-8 -*-
"""
Created on Tue Dec  5 14:02:24 2023

@author: kagecomputer 2
"""

import os

# set path
cwd = os.getcwd()
path = cwd+'\\data\\text-en_clean\\'

# get list of documents in path
l = os.listdir(path)



for i in range(1):
    file = path+l[i]
    print(file)
    t = open(file, encoding='UTF-8')
    text = t.read()
    x = text.split()


frequencies = {}


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