'''
/*
 * Filename: audio_frame_serial_print.py
 *
 * Description: This tool is used to decode audio frames from the
 * CC2650ARC, the CC2650STK development kits and the CC2650 LaunchPad with 
 * CC3200AUDBOOST booster pack. These frames will saved to a wav file for 
 * playback. This script expects audio compressed in ADPCM format.
 *
 * Copyright (C) 2016-2017 Texas Instruments Incorporated - http://www.ti.com/
 *
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *    Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 *    Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the
 *    distribution.
 *
 *    Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 *  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 *  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 *  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 *  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/
'''
from struct import unpack, pack
import struct
import wave
from serial import Serial
from serial import SerialException
from time import time
import time
import winsound

tic1_stepsize_Lut = [
  7,    8,    9,   10,   11,   12,   13,   14, 16,   17,   19,   21,   23,   25,   28,   31,
  34,   37,   41,   45,   50,   55,   60,   66, 73,   80,   88,   97,  107,  118,  130,  143,
  157,  173,  190,  209,  230,  253,  279,  307, 337,  371,  408,  449,  494,  544,  598,  658,
  724,  796,  876,  963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024,
  3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493,10442,11487,12635,13899,
  15289,16818,18500,20350,22385,24623,27086,29794, 32767
]

tic1_IndexLut = [
  -1, -1, -1, -1, 2, 4, 6, 8,
  -1, -1, -1, -1, 2, 4, 6, 8
]

SI_Dec = 0
PV_Dec = 0

def tic1_DecodeSingle(nibble):
    global SI_Dec
    global PV_Dec

    step = tic1_stepsize_Lut[SI_Dec]
    cum_diff  = step>>3;

    SI_Dec += tic1_IndexLut[nibble];

    if SI_Dec < 0:
        SI_Dec = 0
    if SI_Dec > 88:
        SI_Dec = 88;

    if nibble & 4:
        cum_diff += step
    if nibble & 2:
        cum_diff += step>>1
    if nibble & 1:
        cum_diff += step>>2;

    if nibble & 8:
        if PV_Dec < (-32767+cum_diff):
           PV_Dec = -32767
        else:
            PV_Dec -= cum_diff
    else:
        if PV_Dec > (0x7fff-cum_diff):
            PV_Dec = 0x7fff
        else:
            PV_Dec += cum_diff

    return PV_Dec;

decoded = []
buf = ''

def decode_adpcm(_buf):
    global decoded
    global buf
    global SI_Dec
    global PV_Dec

    buf = _buf

    for b in _buf:
        b,= unpack('B', b)
        decoded.append(pack('h', tic1_DecodeSingle(b & 0xF)))
        decoded.append(pack('h', tic1_DecodeSingle(b >> 4)))


def save_wav():
    global decoded

    filename = time.strftime("pdm_test_%Y-%m-%d_%H-%M-%S_adpcm")

    print "saving file"
    w = wave.open("" + filename + ".wav", "w")
    w.setnchannels(1)
    w.setframerate(16000)
    w.setsampwidth(2)
    w.writeframes(''.join(decoded))
    w.close()
    print "...DONE..."

    #clear stuff for next stream
    SI_Dec = 0
    PV_Dec = 0
    decoded = []
    missedFrames = 0

indata = ''
inbuffer = ''
frameNum = 1
bufLen = 100

lastByteTime = 0

prevSeqNum = 0
missedFrames = 0

mFramesCount = 0

try:
    ser = None
    readSoFar = 0
    iter = 0
    frame = bytearray()

    with open('audio', 'rb') as f:  # adjust file name here
        while 1:
            byte = f.read(1)
            if not byte:
                break
            else:
                frame.append(byte)

        str = ''
        for i in frame:
            str += chr(i)

        print len(str)

        while True:
            start = bufLen*iter
            end = bufLen+bufLen*iter
            indata = str[start:end]
            readSoFar = len(indata)

            if end > len(str) and len(decoded):
                if time.time() - lastByteTime > 2:
                    #save wav file
                    save_wav()
                    print mFramesCount
                    print iter
                    exit(0)
            elif indata:
                inbuffer += indata

            if len(inbuffer) == bufLen:
                seqNum, SI_received, PV_received = struct.unpack('BBh', inbuffer[0:4])
                seqNum = (seqNum >> 3)
                print "Frame sequence number: %d" % seqNum

                print "HDR_1 local: %d, HDR_1 received: %d" % (SI_Dec, SI_received)
                print "HDR_2 local: %d, HDR_2 received: %d" % (PV_Dec, PV_received)

                #always use received PV and SI 
                PV_Dec = PV_received
                SI_Dec = SI_received

                if seqNum > prevSeqNum:
                    missedFrames = (seqNum - prevSeqNum -1)
                else:
                    missedFrames = ((seqNum + 32) - prevSeqNum - 1)

                prevSeqNum = seqNum

                if missedFrames > 0:
                    mFramesCount += missedFrames
                    print "######################### MISSED #########################"
                    print missedFrames
                    print "##########################################################"

                decode_adpcm(inbuffer[4:])
                inbuffer = ''
                readSoFar = 0
                iter += 1

                lastByteTime = time.time()

except SerialException as e:
    print "Serial port error"
    print e

finally:
    if ser is not None: ser.close()
