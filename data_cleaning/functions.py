
 
def clean_text(text):
    text = text.replace(',', '')
    text = text.replace('.', ' ')
    text = text.replace(':', '')
    text = text.replace(';', '')
    text = text.lower()
    word_list = text.split()

    return(word_list)

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
    stopwords_list.extend(["got","one", "day", "two", "six", "pm", "am", "ii", 'also'])
    
    #create an empty list to store clean words

    clean_words = []
    
    #Iterate through the words_no_punc list and add non stopwords to the new clean_words list
    for word in words_no_punc:
        if word not in stopwords_list:
            clean_words.append(word)
            
    #find the frequency of words
    fdist = FreqDist(clean_words)        
    
    return fdist
