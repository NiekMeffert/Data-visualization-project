# -*- coding: utf-8 -*-
"""
Created on Mon Nov 27 19:00:17 2023

@author: kagecomputer 2
"""

import os

# Set working directory
#absolute_path = 'Dokumenter/GitHub/Data-visualization-project/data_cleaning'
#os.chdir(absolute_path)
cwd = os.getcwd()
print('Current Working Directory is: ', cwd)



# CLEAN TXT FILES
path = cwd+'\\data\\text-en\\'
l4 = os.listdir(path)

for i in range(len(l4)):
    s = path+l4[i]
    t = open(s, 'r',encoding='UTF-8') # Pull text from txt file
    text = t.read()
    t.close() 
    text = text.replace('The person in question has given us the following information:\n\n','') # Remove sentence from text
    t = open(s, 'w', encoding='UTF-8') # Open file again for writing (overwrites original file)
    t.write(text) # Write text into file
    t.close() 