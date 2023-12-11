    
def clean_text(text):
    text = text.replace(',', '')
    text = text.replace('.', ' ')
    text = text.replace(':', '')
    text = text.replace(';', '')
    text = text.lower()
    word_list = text.split()

    return(word_list)