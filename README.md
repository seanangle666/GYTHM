# GYTHM
A gyroscope 2-rail rhythm game

https://seanangle666.github.io/GYTHM/index.html

# Notation of the Chart

## 1.Metadata

&property = value 

## 2.Mark out & Annotation

Use "()" to mark out what you want,decoder will ignore it.
ex: (240#)

Use"||" to do Annotation.
ex: |decoder will ignore the text in double pipe|

## 3.Charting
Use "0" to "F" to  represent the position of the notes on the track and use "," to seperate notes.

ex: 1,2,3,4,

If you have more than 1 note in same time , you can use "*".

ex: 2*4

Some note need to add "detail", to add detail,you can use "<>".
The decoder will  make the cases like <4/1> as the duration of a hold when processing things inside <> by default.

ex:
If you want to add a hold , you can wrote it as : 1h<4:1>,

If you need add more property for the note , you can use <property = value>.

ex.for the crash note , you can wrote it as : 0c<face = L>,





