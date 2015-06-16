import json
from pprint import pprint


f = open("Lawyers.txt", "rU")

lines = f.readlines()

lines = [line.rstrip('\n') for line in lines]
lines = [line.rstrip(',') for line in lines]
lines = lines[8:64]


objects = []
raceeth_cats = ['NHWhite', 'Black', 'Asian', 'Hispanic', 'AmIndian', 'NHOther', 'NHMulti']
earn2_cats = ['<40K','40-54K','55-69K','70-84K','85-99K','100-124K','125-149K','150-199K','200K+']
agepro_cats = ['25-34','35-44','45-54','55-64']
gender_cats = ['Male','Female']

for line in lines:
	line = line.split(',')
	for i, el in enumerate(line):
		line[i] = {"Dep": el}
	objects.append(line)

for o in objects:
	for i, el in enumerate(o):
		o[i]["Earn2"] = earn2_cats[i]

i = 0
for o in objects:
	val = agepro_cats[i]
	for el in o:
		el["AgePro"] = agepro_cats[i]
	if (i==3):
		i = 0
	else:
		i += 1

def cast(l, key, value):
	for el in l:
		el[key] = value

i = 0
j = 0

def switch(i):
	if (i==1):
		return 0
	elif (i==0):
		return 1

for o in objects:
	gen = gender_cats[i]
	cast(o, "Gender", gen)
	if (j==3):
		j = 0
		i = switch(i)
	else:
		j += 1

i = 0
j = 0
for o in objects:
	gen = raceeth_cats[i]
	cast(o, "RaceEth", gen)
	if (j==7):
		j = 0
		i += 1
	else:
		j += 1
final_objects = []
for o in objects:
	for m in o:
		final_objects.append(m)

with open('Lawyers.json', 'w') as outfile:
    j = json.dumps(final_objects, indent=4)
    outfile.write(j)







f.close() 