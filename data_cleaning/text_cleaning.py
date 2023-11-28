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
l = os.listdir(path)


# Inspect first lines
first_lines = []
for i in range(len(l)):
    s = path+l[i]
    t = open(s, 'r+',encoding='UTF-8') # Pull text from txt file
    fl = t.readline()
    if fl not in first_lines:
        first_lines.append(fl)    
    t.close()

# Only one line needs to get removed from the list. We remove it
rl = 'On May 22, 1944, along with 26 of my colleagues (all commandeered medical doctors) I was sent from the Aknaszlatina ghetto to Auschwitz. Following selection I was sent to the right and, after a 24-hour stay in Auschwitz, I was transferred to Buna with an inmate population of 14 thousand. There I had worked for about 12 days in the 197th construction company when the chief medical officer of the Buna camp (an SS-Hauptsturmführer) summoned all physicians to appear before him. We lined up, all fifty of us. They told us that professional pathologists could volunteer for light work. Of the fifty physicians two of us stepped forward; I was all the more eager to volunteer as I had already realized I would not last much longer working in the concrete mixing brigade. Following a thorough oral examination and an interview, the two of us were accepted.  I studied medicine in Germany and practiced as a pathologist for many years. I easily passed the test, as did my colleague who worked in a Medical School in Strasbourg. Within one hour, accompanied by two armed SS guards, we were put in a well-equipped Red Cross ambulance. To my horror, we were driven to the courtyard of Crematorium 1 in Auschwitz where our documents were handed over to the commander of the Crematorium, Oberscharführer Mussfeld. They immediately gave us firm  instructions what we may and may not look at. Then we were led into a clean room, and Oberscharführer Mussfeld let us know that it was furnished specifically for us at the orders of dr. Mengele. The Crematorium staff, known as the Sonderkommando and counting some two hundred inmates, lived on the second floor. The Oberscharführer immediately requisitioned for us a full set of clothing and underwear of excellent quality taken from gassed victims. Dr. Mengele arrived after a few hours and put us through another oral examination lasting about one hour. He then gave us our first assignment: it involved the medical examination of selected individuals with some form of abnormal development. We took measurements of these people, then Oberscharführer Mussfeld shot them in the head with a Kleinkaliber, i.e., a 6-mm gun, after which we were ordered to perform an autopsy and prepare a detailed report. Subsequently, we applied chloride of lime to the abnormally developed corpses and sent the thoroughly cleaned and packed bones to the Anthropological Institute in Berlin-Dahlem. These experiments were repeated sporadically, until one day at midnight SS officers woke us and led us to the dissecting room, where dr. Mengele was already waiting for us. In the workroom next to the autopsy room there were 14 Gypsy twins under SS guard, sobbing bitterly. Without saying a word, Dr. Mengele prepared a 10-cm3  and a 5-cm3 syringe. From a box he took out evipan, from another he placed chloroform in 20-cm3 vials on a table. Then the first twin was brought in, a young girl of around 14. Dr. Mengele ordered me to undress her and place her on the autopsy table. Then he administered an intravenous injection of evipan in the right arm. After the child lost consciousness, he touched for the left heart ventricle and injected 10 cm3 of chloroform.\n'
first_lines.remove(rl)


# Remove first lines from the data set

for i in range(len(l)):
    s = path+l[i]
    t = open(s,'r', encoding='UTF-8')
    text = t.read()
    t.close()
    for j in range(len(first_lines)):
        text = text.replace(first_lines[j],'')
    path = cwd+'\\data\\text-en_clean\\'
    s = path+l[i]
    t = open(s, 'w', encoding='UTF-8') # Open file again for writing (overwrites original file)
    t.write(text) # Write text into file
    t.close() 

    
    text = text.replace('The person in question has given us the following information:','') # Remove sentence from text
    text = text.replace('\n','')
    s = path++l[i]
    t = open(s, 'w', encoding='UTF-8') # Open file again for writing (overwrites original file)
    t.write(text) # Write text into file
    t.close() 





