
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
  S      E     X3.1        \n
```

MRCP is used to frame instructions sent to the mrc and define the execution mode. The first symbol `S` denotes the start of an MRCP command. The second symbol `E/W/Q` is used to set the execution mode. A instruction can be executed immidiately `E - execute`, added to a in memory queue `Q` and therefore exequted sequentially (only 300 Bytes fit in memory, use `B` to receive the free queue). `W` is used to store the instruction in the EEProm storage. If a instructions are stored in the EEProm, the MRC will automatically loop through them until the execution mode is changed to `Q` or the EEProm is cleared `single W`.

**Examples**
```
S E X3.1 Y42 Z1.6 \n
---
S - start character
E - move command
X,Y,Z - target coordinates

S E  X3.1 Y42 Z1.6  \n
+ +  +-----------+  +----+
| |  |                   |
| |  +->payload          |
| |                      |
| +---->execution method |
|                        |
+------>start/end <------+

```



## Execution Mode

|character| command |description|
|   ---   |   ---   |    ---    |
| Q {mri} |queue in     |add the mri (MP robot instruction) to the execution queue.|
| Q       |clear queue  |clear the inctruction queue.|
| E {mri} |execute      |immediately execute mri.|
| W {mri} |write        |write mri to EEPROM.|
| W       |clear EEPROM |clear EEPROM.|

# mril
MicroPede Robot Instruction Language.
A MRIL instruction is a string, comprising one or more commands.

`<mril>` example: `M01 X10 Y-5 Z3 I0 1`

A command is the combination of a symbol, a single digit option (optional) and multiple digit value (including sign).

`<command>[<option>][<value>]` example: `R5 -30.1`

The MRC is statefull, meaning that previous commands are still applied if the current instruction does not override them. E.g. setting a velocity `V10`. All sucessive instructions still implicitly use `V10` even if they do not set the velocity again.

## Commands


**Movement**

| char | command           | syntax                         | example         | description                                            |
|------|-------------------|--------------------------------|-----------------|--------------------------------------------------------|
| M    | movement method   | M{method:00/01/02}             | M00             | 00 - P2P; 01 - Linear; 02 - Circular                   |
| V    | velocity          | V{velocity:0-999}              | V100            | Sets linear or angular velocity based on M command! [deg/s, mm/s]    |
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
| #    | comment        | #{comment:0-9,a-z}           | # home pos  |                        |         |         |

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


## Example MRCP + Instructions

```gcode
# Use Queue to wait for logic and execute instruction sequentially
S Q M00 R0 0 R1 0 R2 0 R3 0 R4 0 R5 0 \n # Move P2P to all axis 0 position 
S Q I0 1 \n                              # Wait for input 0 to be HIGH
S Q M01 X0 \n                            # Move linar to X 0
S Q O1 0 O2 0 X22 Y-10 \n                # Sets outputs 1,2 to LOW and moves to x:22,y:-10

# Use Execute to query for status
S E XZA \n                               # Get the current values of X,Z and A (returns :X3.1Z1.6A180)
S E X3.1 Y42 Z1.6 A180 B0 C180 \n        # Execute the instruction move to 3.1,42,1.6,180,0,180 immediately

# Use Write to store instructions on EEProm
S W X3.1 Y42 Z1.6 A180 B0 C180 \n        # Writes the instruction move to 3.1,42,1.6,180,0,180 to EEProm
```

## Atom Syntax Highlighting - Grammar

If you use Atom and want syntax highlighting for MRIL, clone the `language-mril` directory and run `apm link` inside.
Atom should automatically detect MRIL files by filextension `.mril`.
