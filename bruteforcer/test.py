import math as m, random as r

def obfuscate(arg): # what the fuckkkkkkkk
    arr = [4 * m.ceil(25 * r.random())] # = 1 item array containing 4*(int on 1 - 25 inclusive)
    for i in range(1, int(arr[0]/4)):
        arr.append(round(100 * r.random()))
    for j in range(len(list(str(arg)))):
        char = list(str(arg))[j]
        arr.append(ord(char[0]) + int([56, 82, 44, 92, 35, 4, 75, 32, 38, 86, 65, 86, 48][j % 13]))
    return (str(arr).replace("[", "").replace("]", "").replace(", ", "."))

o = obfuscate("1")
print(o)