const unDusp = require("../unDusp")
const renderAudioBuffer = require('./renderAudioBuffer')

const openBracketReg = /[\[\(\{]/

class DuspPlayer {
  constructor(str) {
    this.nowPlayingSource = null
    this.ctx = new AudioContext
    this.creationStamp = 'dusp-' + new Date().getTime()

    this.htmlInterface()

    if(str)
      this.saveStr = str

    this.save()
  }

  async play(loop=false) {
    this.stop()

    let duspStr = this.interface.dusp.value
    let duration = parseDuration(this.interface.duration.value)

    let outlet = unDusp(duspStr, duration)
    if(!outlet)
      throw "Error in the dusp"

    let buffer = await renderAudioBuffer(outlet, duration)

    let source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    source.connect(this.ctx.destination)
    source.start()
    source.onended = () => this.stop()

    console.log('playing', buffer, source)

    this.nowPlayingSource = source
    this.looping = loop

    this.updateButtons()
  }

  stop() {
    if(this.nowPlayingSource)
      this.nowPlayingSource.stop()
    this.nowPlayingSource = null
    this.looping = null
    this.updateButtons()
  }

  get saveStr() {
    return JSON.stringify({
      duspStr: this.interface.dusp.value,
      duration: parseDuration(this.interface.duration.value),
      creationStamp: this.creationStamp,
    })
  }

  set saveStr(str) {
    let ob = JSON.parse(str)
    this.interface.dusp.value = ob.duspStr
    this.interface.duration.value = formatDuration(ob.duration)
    this.creationStamp = ob.creationStamp
  }

  save() {
    window.localStorage.setItem(this.creationStamp, this.saveStr)
  }

  close() {
    clearInterval(this.saveTimer)
    window.localStorage.removeItem(this.creationStamp)
    this.interface.main.parentNode.removeChild(this.interface.main)
  }

  htmlInterface() {
    if(!document)
      throw "DuspPlayer cannot generate HTML interface outside of browser"
    if(this.interface)
      return this.interface

    let mainDIV = document.createElement('div')
    mainDIV.addEventListener('keydown', (e) => {
      if(e.metaKey && e.keyCode == 13) {
        this.play(e.shiftKey)
      } else if(e.keyCode == 27) {
        this.stop()
        if(e.metaKey) {
          this.close()
        }
      }
      this.save()
    })
    mainDIV.className = 'DuspPlayer'

    let inputWrapperDIV = document.createElement('div')
    inputWrapperDIV.className = 'inputwrapper'
    mainDIV.appendChild(inputWrapperDIV)

    let duspINPUT = document.createElement('textarea')
    duspINPUT.addEventListener('keydown', function(e) {
      if(e.keyCode == 9) {
        e.preventDefault()
        var s = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "  " + this.value.substring(this.selectionEnd);
        this.selectionEnd = s+2;
      }

      if(e.key == '(') {
        e.preventDefault()
        let s = this.selectionStart
        let t = this.selectionEnd
        this.value = this.value.substring(0, s) +
          '(' + this.value.substring(s,t) +
          ')' + this.value.substring(t)

        this.setSelectionRange(s+1, t+1)
      }

      if(e.key == '[') {
        e.preventDefault()
        let s = this.selectionStart
        let t = this.selectionEnd
        this.value = this.value.substring(0, s) +
          '[' + this.value.substring(s,t) +
          ']' + this.value.substring(t)

        this.setSelectionRange(s+1, t+1)
      }
      if(e.key == '\"') {
        e.preventDefault()
        let s = this.selectionStart
        let t = this.selectionEnd
        this.value = this.value.substring(0, s) +
          '"' + this.value.substring(s,t) +
          '"' + this.value.substring(t)

        this.setSelectionRange(s+1, t+1)
      }

      if(e.keyCode == 8) {
        // backspace

      }

      if(e.keyCode == 13 && !e.metaKey) {
        e.preventDefault()
        let s = this.selectionStart;
        let t = this.selectionEnd

        let before = this.value.substring(0,s)
        let line = before.slice(before.lastIndexOf('\n'))
        let nSpace = 0
        for(let i=before.lastIndexOf('\n')+1; i<before.length; i++, nSpace++)
          if(before[i] != ' ')
            break

        if(openBracketReg.test(before[before.length-1]))
          nSpace += 2

        let tabs = ' '.repeat(nSpace)
        this.value = before + '\n' + tabs + this.value.substring(t)
        this.selectionEnd = s+1+tabs.length
      }
    })
    duspINPUT.value = 'O200'
    inputWrapperDIV.appendChild(duspINPUT)

    let controlDIV = document.createElement('div')
    controlDIV.className = 'controls'
    mainDIV.appendChild(controlDIV)

    let durationLABEL = document.createElement('label')
    durationLABEL.innerText = 'duration:'
    controlDIV.appendChild(durationLABEL)

    let durationINPUT = document.createElement('input')
    durationINPUT.value = formatDuration(5)
    durationINPUT.onclick = function() {
      this.setSelectionRange(0, this.value.length)
    }
    durationINPUT.onblur = () => {
      durationINPUT.value = formatDuration(parseDuration(durationINPUT.value))
    }
    controlDIV.appendChild(durationINPUT)


    let playBTN = document.createElement('button')
    playBTN.innerText = 'play'
    playBTN.onclick = () => this.play(false)
    controlDIV.appendChild(playBTN)

    let stopBTN = document.createElement('button')
    stopBTN.innerText = 'stop'
    stopBTN.onclick = () => this.stop()
    controlDIV.appendChild(stopBTN)

    let loopBTN = document.createElement('button')
    loopBTN.innerText = 'play looped'
    loopBTN.onclick = () => this.play(true)
    controlDIV.appendChild(loopBTN)

    this.interface = {
      main: mainDIV,
      dusp: duspINPUT,
      duration: durationINPUT,
      play: playBTN,
      loop: loopBTN,
      stop: stopBTN,
    }

    this.updateButtons()

    return this.interface.main
  }

  updateButtons() {
    this.interface.play.className = 'inactive'
    this.interface.loop.className = 'inactive'
    this.interface.stop.className = 'inactive'
    if(this.nowPlayingSource) {
      if(this.looping)
        this.interface.loop.className = 'active'
      else
        this.interface.play.className = 'active'
    } else
      this.interface.stop.className = 'active'
  }
}
module.exports = DuspPlayer

function parseDuration(str) {
  let parts = str.split(':')
  if(parts.length == 2) {
    let minutes = parseInt(parts[0]) || 0
    let seconds = parseFloat(parts[1]) || 0
    return minutes*60 + seconds
  } else if(parts.length == 1) {
    return parseFloat(parts[0])
  }
}
function formatDuration(seconds) {
  let minutes = Math.floor(seconds/60).toString()
  if(minutes.length == 1)
    minutes = '0'+minutes
  seconds -= minutes * 60
  seconds = (Math.abs(seconds) < 10 ? '0' : '') + seconds.toFixed(3)
  return minutes + ":" + seconds
}