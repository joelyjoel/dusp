const unDusp = require('../src/unDusp')
const connectToWAA = require("../src/webaudioapi/connectToWAA")

const ctx = new AudioContext()
window.AUDIOCTX = ctx

let nowPlayingRenderStream = null

console.log(unDusp)

window.onload = function() {
  document.getElementById("user-input").onkeypress = function(e) {
    if(e.keyCode == 13) {
      play(this.value)
    }
  }
}

function play(str) {
  if(nowPlayingRenderStream)
    nowPlayingRenderStream.stop()
  let unit = unDusp(str)
  if(!unit)
    throw "Some problem with the input"

  let outlet = unit.defaultOutlet
  nowPlayingRenderStream = connectToWAA(outlet, ctx.destination)
}
