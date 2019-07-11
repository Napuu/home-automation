import subprocess

def isLaptopUp():

    process = subprocess.check_output("ping 192.168.1.26 -t 1 -c 3; exit 0", shell=True)
    if " 0 received," in process.decode("utf-8"):
        return False 
    else:
        return True 

