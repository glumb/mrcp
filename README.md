
<img src="https://cloud.githubusercontent.com/assets/3062564/24832709/e76f61aa-1cb5-11e7-8eda-11b82650cf1a.png" alt="mrcp" width="70" >  <img src="https://cloud.githubusercontent.com/assets/3062564/24832711/eb0a8416-1cb5-11e7-98fa-d0ddccd31eff.png" alt="mril" width="70" >

# mrcp
MicroPede Robot Control Protocol. 

Work in progress 😃

**Design Goals**
- simple to use 😎
- text based 📖
- g-code like 💻
- extensible ±

**Schema**
```
<start><mode><instruction><end>
```
**Examples**
```
S M X3.1 Y42 Z1.6 \n
---
S - start character
M - move command
X,Y,Z - target coordinates

S M  X3.1 Y42 Z1.6  \n
+ +  +-----------+  +----+
| |  |                   |
| |  +->payload          |
| |                      |
| +---->execution method |
|                        |
+------>start/end <------+

```

## Commands

|character| command |description|
|   ---   |   ---   |    ---    |
|        Q|queue in |add the mri (MP robot instruction) to the execution queue.|
|        M|move to  |immediately execute mri.|
|        W|write    |write mro to EEPROM.|

# mril
MicroPede Robot Instruction Language

## Commands


**Movement**

|char| command | syntax    | example   | description |   returns   |   example  |
|   ---   |   ---   |    ---    |   ----    |     ---     |     ---     |     ---    |
|        M| movement method| | | | |
|        V| velocity| V<0-999>| | | |
|        X| x coordinate| X<±0-990> | | | |
|        Y| | Y<±0-990>| Y -12.3| | |
|        Z| | Z<±0-990>| | | |
|        A| euler angle a| | | | |
|        B| euler angle b| | | | |
|        C| euler angle c| | | | |
|        R| axis rotation| | | | |
|        T| | | | | |


**IO**

|char| command | syntax    | example   | description |   returns   |   example  |
|   ---   |   ---   |    ---    |   ----    |     ---     |     ---     |     ---    |
|       I | wait for input| I<0-9 [pin number]><0/1 [state]> | I9 0 | wait for pin 9 to be LOW/0 |
|       O | set output| O<0-9 [pin number]><0/1 [state]> | O3 1 | set pin 3 to HIGH |


**Monitoring**

|char| command | syntax    | example   | description |   returns   |   example  |
|   ---   |   ---   |    ---    |   ----    |     ---     |     ---     |     ---    |
|       N | instruction number| N<0-9999> | N142 | command number 142 | N<0/1 [0-executing/1-executed]><0-9999 [number] | N1 142
|       X | get X coordinate| X | X | returns current X coordinate | X<±0-990> | X
