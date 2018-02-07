
from requests import get
from bs4 import BeautifulSoup
from tkinter import Tk
from collections import namedtuple
import json
import shutil
import os


Image = namedtuple('image', 'url filename index')
def getClipboard():
    return Tk().clipboard_get()

soup = BeautifulSoup(getClipboard(), 'lxml')

titles = [' '.join(b.text.split(' ')[1::]) for b in soup.find_all('b')[1::]]

all_questions = [str(inp.next_sibling).strip() for inp in soup.find_all('input')]
questions = [all_questions[n*3:n*3+3] for n in range(0, 30)]
correct = [inp.text for inp in soup.find_all('span', {'style': 'background: green;'})]
images = [ Image('https://apps.azdot.gov/mvd/PracticeTest/' + img['src'], img['src'].split('/')[-1], int(img['src'].split('Q')[1].split('.')[0]) - 1) for img in soup.find_all('img') if "orrect" not in img['src'] ]

questions = [ {'title': a, 'answers': b, 'correct': c} for (a, b, c) in (zip(titles, questions, correct))]

for image in images:  # type: Image
    file_path = os.path.join(os.getcwd(), 'img', image.filename)
    if not os.path.exists(file_path):
        r = get(image.url, stream=True)
        with open(file_path, 'wb') as out_file:
            shutil.copyfileobj(r.raw, out_file)
        del r
    questions[image.index]['image'] = os.path.join('img', image.filename)

print(json.dumps(questions))
