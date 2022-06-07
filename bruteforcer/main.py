import requests, json, math as m, random as r, re, os, time
from datetime import datetime as dt

extId = "[PLACEHOLDER]"
url = "https://hb8ausjesa.execute-api.us-east-1.amazonaws.com/dev"
myToken = "[PLACEHOLDER]"

def main():
    while True:
        updateScore(300, myToken)
        resp = getMe(myToken)
        print(resp['links'])

def getLeaderboard():
    resp = requests.get(url + "/leaderboard")

    rJson = json.loads(resp.content.decode('utf-8'))

    leaderDict = {}
    for item in rJson['items']:
        leaderDict[item['username']] = item['links']

    return  leaderDict

def checkSpeeds(checkTime):
    startDict = getLeaderboard()

    time.sleep(checkTime)

    endDict = getLeaderboard()

    rateDict = {}
    for user in startDict:
        if user in endDict:
            rateDict[user] = (endDict[user] - startDict[user])/checkTime
    
    return rateDict

def getMe(token):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    body = json.dumps({"token": token})

    resp = requests.post(url+"/me", headers=headers, data=body)

    respJson = json.loads(resp.content.decode('utf-8'))

    return respJson


def updateScore(changeScore, token):

    payload = obfuscate(json.dumps({ 
        "token": token,
        "value": changeScore,
        "time": getCurrentTime()
    }))



    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
                
    body = json.dumps({"value" : payload})

    resp = requests.post(url+"/value", headers=headers, data=body)

    if (resp.status_code == 500):
        print("returned code 500. getting errors")
        decodeJson = json.loads(resp.content.decode('utf-8'))
        print("error: " + decodeJson["message"])


def addCookie():
    pass

# def getCookies(): # this function doesnt work cause i cant get leveldb working and cant just bruteforce it until it works
#     file = open("/Users/melaniemiller/Library/Application Support/Google/Chrome/Default/Local Extension Settings/jajemmdkpanhmmnlddnclnefeplgohah/000003.log", "rb")
#     bytes = file.read()
#     file.close()
#     print(bytes)
#     string = ""
#     for i in range(len(bytes)-1):
#         try:
#             string += bytes[i:i+1].decode('utf-8')
#         except:
#             pass
#     re.sub('[^\x00-\x7F]', "", string)
    

def obfuscate(arg): # i think this is a correct recreation of this function
    arr = [4 * m.ceil(25 * r.random())] # = 1 item array containing 4*(int on 1 - 25 inclusive)
    for i in range(1, int(arr[0]/4)):
        arr.append(round(100 * r.random()))
    for j in range(len(list(str(arg)))):
        char = list(str(arg))[j]
        arr.append(ord(char[0]) + int([56, 82, 44, 92, 35, 4, 75, 32, 38, 86, 65, 86, 48][j % 13]))
    return (str(arr).replace("[", "").replace("]", "").replace(", ", "."))

def getCurrentTime():
    now = dt.utcnow()
    return now.hour*3600 + now.minute*60 + now.second

def checkWinner():
    resp = requests.get(url + '/winner')

    rJson = json.loads(resp.content.decode('utf-8'))

    try:
        return rJson['end']
    except:
        return rJson

def checkBanners(): # idk what this does but i recreated it anyway.
    resp = requests.get(url + '/banners') # okay i guess it does literally nothing right now

    rJson = json.loads(resp.content.decode('utf-8'))

    return rJson
    

def signupNewUser(user, email):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }


    body = json.dumps({
        "username": user,
        "email": email
    })

    resp = requests.post(url + "/signup", headers=headers, data=body)

    respJson = json.loads(resp.content.decode('utf-8'))

    if respJson['status'] == "ok":
        return respJson['token']
    else:
        print('signup failed')
        print(respJson['message'])
        return -1

print(checkWinner())

# print(token)