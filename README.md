
<img src="https://cloud.githubusercontent.com/assets/3062564/24832709/e76f61aa-1cb5-11e7-8eda-11b82650cf1a.png" alt="mrcp" width="70" >  <img src="https://cloud.githubusercontent.com/assets/3062564/24832711/eb0a8416-1cb5-11e7-98fa-d0ddccd31eff.png" alt="mril" width="70" >

# mrcp
MicroPede Robot Control Protocol. 

```gcode
M01 V50 X15 Y42 Z1.6 A-3.1 B0 C3.1
```

Work in progress 😃

**Design Goals**
The protocol was designed to be a very simple to use method to control hobby robotic arms. 
Since all commands are in plain text, they can easily be manually written and send over serial via `screen` to the robot, to control it in a adhoc fashion. 🤖

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
MicroPede Robot Instruction Language.
A MRIL instruction is a string, comprising one or more commands.

`<mril>` example: `M01 X10 Y-5 Z3 I0 1`

A command is the combination of a symbol, a single digit option (optional) and multiple digit value (including sign).

`<command>[<option>][<value>]` example: `R5 -30.1`

Commands

## Commands


**Movement**

| char | command           | syntax                         | example         | description                                            |
|------|-------------------|--------------------------------|-----------------|--------------------------------------------------------|
| M    | movement method   | M{method:00/01/02}             | M00             | 00 - P2P; 01 - Linear; 02 - Circular                   |
| V    | velocity          | V{velocity:0-999}              | V100            | Sets linear or angular velocity based on M command!    |
| X    | x coordinate      | X{coordinate:±0-999}           | X 0             |                                                        |
| Y    | y coordinate      | Y{coordinate:±0-999}           | Y -12.3         |                                                        |
| Z    | z coordinate      | Z{coordinate:±0-999}           | Z 0.5           |                                                        |
| A    | euler angle a     | A{angle(deg):±0-360}           | A270            | Euler in Z->Y->X rotation order, moving axis.          |
| B    | euler angle b     | B{angle(deg):±0-360}           | B180            |                                                        |
| C    | euler angle c     | C{angle(deg):±0-360}           | C55             |                                                        |
| R    | axis rotation     | R{joint:0-9}{rot(deg):{±0-360} | R2 90 R7 0      | set target rotation. Additional axis (6-9) may be used |
| T    | anchor circ. move | T{axis:0-2}{coordinate:±0-999} | T0 2 T1 5 T2 -5 | set anchor point for circular movement interpolation   |

**IO**

| char | command        | syntax                       | example | description                | returns | example |
|------|----------------|------------------------------|---------|----------------------------|---------|---------|
| I    | wait for input | I{pin number:0-9}{state:0/1} | I9 0    | wait for pin 9 to be LOW/0 |         |         |
| O    | set output     | O{pin number:0-9}{state:0/1} | O3 1    | set pin 3 to HIGH          |         |         |

**misc**

| char | command        | syntax                       | example | description                | returns | example |
|------|----------------|------------------------------|---------|----------------------------|---------|---------|
| D    | delay          | D{ms:0-99999}                | D 2000  | wait 2s                    |         |         |

**Monitoring**

| char | command            | syntax           | example | description                  | returns                                         | example |
|------|--------------------|------------------|---------|------------------------------|-------------------------------------------------|---------|
| N    | instruction number | N{number:0-9999} | N142    | command number 142           | N{0-executing/1-executed:0/1}{number:0-9999}    | N1 142  |
| X    | get X coordinate   | X                | X       | returns current X coordinate | X{coordinate:±0-999}             | X -12   |
| Y    | get Y coordinate   | Y                | Y       | returns current Y coordinate | Y{coordinate:±0-999}             | Y 5     |
| Z    | get Z coordinate   | Z                | Z       | returns current Z coordinate | Z{coordinate:±0-999}             | Z -99   |
| A    | get A coordinate   | A                | A       | returns current A coordinate | A{coordinate:±0-360}             | A 0     |
| B    | get B coordinate   | B                | B       | returns current B coordinate | B{coordinate:±0-360}             | B -180  |
| C    | get C coordinate   | C                | C       | returns current C coordinate | C{coordinate:±0-360}             | C 120   |

