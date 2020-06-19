<template>
  <div class="container">
    <h1>Will It Shred?</h1>

    <p>Picking the right motor for your Precious Plastic Shredder can be tricky</p>
    <p>Use this calculator to help find out if that motor/gearing combination you are considering will shred within your expectations</p>

    <div class="calculator">
      <section class="inputs">
        <h3>⚡️ Motor</h3>
        <label for="rpm">RPM</label>
        <input type="text" name="rpm" v-model="motor.rpm" />
        <br />
        <label for="hz">Mains Freq. Hz</label>
        <p class="input-hint">Normally 50 or 60</p>
        <input type="text" name="hz" v-model="motor.hz" />
        <label for="poles">No. Poles</label>
        <p class="input-hint">An even number such as 2 or 4</p>
        <input type="text" name="poles" v-model="motor.poles" />
        <br />
        <label for="kilowatts">Power, KW</label>
        <input type="text" name="kilowatts" v-model="motor.kilowatts" />
        <label for="watts">or W</label>
        <input type="text" name="watts" v-model="motor.watts" />
        <br />
        <label for="volts">Voltage V</label>
        <input type="text" name="volts" v-model="motor.volts" />
        <label for="amps">Current Amps/A/I</label>
        <input type="text" name="amps" v-model="motor.amps" />

        <h3>⚙️ Gearing</h3>
        <label for="ratio">Gear Ratio (n: 1)</label>
        <input type="text" name="ratio" v-model="gearing.ratio" placeholder="n" />
        <label for="maxTorque">Maximum Torque (nm)</label>
        <input type="text" name="maxTorque" v-model="gearing.maxTorque" />
      </section>
  
      <section class="results">
        <h3>📝 Results</h3>
        <dl>
          <dt v-if="shredderResultHint != null">Result</dt>
          <dd v-if="shredderResultHint != null">{{shredderResultHint.title}} {{shredderResultHint.emoji}}</dd>

          <dt v-if="shredderSpeedRating != null">RPM</dt>
          <dd v-if="shredderSpeedRating != null">{{shredderRPM | number(1)}} => {{shredderSpeedRating.title}}</dd>

          <dt v-if="shredderTorqueRating != null">Torque (nm)</dt>
          <dd v-if="shredderTorqueRating != null">{{shredderTorque | number(1)}} => {{shredderTorqueRating.title}}</dd>
        </dl>
        <div class="hint-body">
          <p v-if="shredderResultHint == null">Enter more data for a result</p>
          <p v-if="shredderResultHint != null">{{shredderResultHint.body}}</p>
        </div>
      </section>

    </div>
    <pre>Will It Shred v1 originally developed for Excel by Andy Noyes</pre>
    <pre>Transcribed for web by Kyle Newsome</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ShredderInputData, RatingResult, getRating } from '../DataStructure'

class MotorData {
  rpm?: number

  hz?: number
  poles?: number

  kilowatts?: number
  watts?: number

  volts?: number
  amps?: number
}

class GearingData {
  ratio?: number
  maxTorque?: number
  efficiency: number = 0.75
}

class Hint {
  title: string
  body: string
  emoji: string

  constructor(title: string, body: string, emoji: string) {
    this.title = title
    this.body = body
    this.emoji = emoji
  }
}

export default Vue.extend({
  name: 'ShredderCalculator',
  props: {
    inputData: Object
  },
  created: function () {
    console.log("Calculator created", this.shredderInputData)
  },
  data: function () { 
    return {
      motor: new MotorData(),
      gearing: new GearingData()
    }
  },
  filters: {
    number: function (value: string, decimals: string) {
      if (!value) { return '' } 
      return parseFloat(value)
        .toFixed(parseInt(decimals))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  },
  computed: {
    shredderInputData: function (): ShredderInputData {
      return this.inputData as ShredderInputData
    },
    shredderRPM: function(): number | null {
      return this.getComputedShredderRPM()
    },
    shredderTorque: function(): number | null {
      return this.getComputedShredderTorque()
    },
    shredderSpeedRating: function(): RatingResult | null {
      return this.getShredderRPMRating();
    },
    shredderTorqueRating: function(): RatingResult | null {
      return this.getShredderTorqueRating();
    },
    shredderResultHint: function(): Hint | null {
      return this.getShredderHint();
    }
  },
  methods: {
    getComputedMotorRPM: function(): number | null {
      if(this.motor.rpm) {
        return this.motor.rpm
      }
      else if(this.motor.hz && this.motor.poles) {
        return (this.motor.hz * 114) / this.motor.poles
      }
      return null
    },
  
    getComputedMotorWatts: function(): number | null {
      if (this.motor.watts) {
        return this.motor.watts
      }
      else if (this.motor.kilowatts) {
        return this.motor.kilowatts * 1000
      }
      else if (this.motor.volts && this.motor.amps) {
        return this.motor.volts & this.motor.amps * 0.8
      }
      return null
    },

    getComputedMotorTorque: function(): number | null {
      const computedRPM = this.getComputedMotorRPM()
      const computedWatts = this.getComputedMotorWatts()
      if(computedRPM && computedWatts) {
        return computedWatts / (computedRPM * 2 * Math.PI / 60)
      }
      return null
    },

    getComputedShredderTorque: function(): number | null {
      const computedMotorTorque = this.getComputedMotorTorque()
      if (this.gearing.ratio && computedMotorTorque) {
        return this.gearing.ratio * computedMotorTorque * this.gearing.efficiency
      } 
      return null
    },

    getComputedShredderRPM: function(): number | null {
      const computedRPM = this.getComputedMotorRPM()
      if (this.gearing.ratio && computedRPM) {
        return computedRPM / this.gearing.ratio
      } 
      return null
    },

    getShredderRPMRating: function(): RatingResult | null {
      let rpm = this.getComputedShredderRPM()
      if (!rpm) return null
      return getRating(this.shredderInputData.speedRatings, rpm)
    },

    getShredderTorqueRating: function(): RatingResult | null {
      let torque = this.getComputedShredderTorque()
      if (!torque) return null
      return getRating(this.shredderInputData.torqueRatings, torque)
    },

    getShredderHint: function(): Hint | null {
      if (!this.shredderTorqueRating || !this.shredderSpeedRating) {
        return null
      }

      let hintTitle: string = "No Data"
      let hintEmoji: string = ""
      let hints: string[] = []

      switch (this.shredderTorqueRating.value) {
        case 1:
          hints.push(`The torque is low`)
          hintTitle = "Won't shred 😫"
          break
        case 2:
          hints.push(`Will shred light material but will jam often.`)
          hintTitle = "Poor 🤨"
          break
        case 3:
          hints.push(`Good torque, should not jam often. May jam occasionally on thicker plastic.`)
          hintTitle = "Good 😀"
          break
        case 4:
          hints.push(`Superior torque, should cope with thicker plastics and only jam infequently.`)
          hintTitle = "Superior 😆"
          break
        case 5:
          hintTitle = "Danger! 🚨"
          hints.push(`The torque is very high and may damage the shredder unit or gearbox.
                \n A less powerful motor would be better.`)
          if (this.shredderSpeedRating.value == 1 || this.shredderSpeedRating.value == 2) {
            hints.push(`This may be a good choice of motor but the gearbox has too high a reduction ratio.`)
          }
          break
      }

      switch (this.shredderSpeedRating.value) {
        case 1:
          hints.push(`The speed is too low`)
          if (this.shredderTorqueRating.value == 3 || this.shredderTorqueRating.value == 4) {
            hintTitle = "Marginal 😐"
          }
          break
        case 2:
          hints.push(`The speed is low.`)
          if (this.shredderTorqueRating.value == 3 || this.shredderTorqueRating.value == 4) {
            hintTitle = "Fair 🙂"
            hints.push(`This may not be a problem if you aren't in a hurry.`)
          }
          break
        case 3:
          hints.push(`Good speed.`)
          if (this.shredderTorqueRating.value == 2) {
            hintTitle = "Marginal 😐"
          }
          break
        case 4:
          hints.push(`The speed is high.`)
          if (this.shredderTorqueRating.value == 1 || this.shredderTorqueRating.value == 2) {
            hints.push(`You need to use a higher gear reduction.`)
          } else if (this.shredderTorqueRating.value == 3) {
            hintTitle = "Fair 🙂"
            hints.push(`It will shred but may have trouble feeding material due to the speed.`)
          } else if (this.shredderTorqueRating.value == 4) {
            hintTitle = "Fair 🙂"
            hints.push(`A larger gear reduction or slower motor may work better.`)
          }
          break
        case 5:
          hints.push(`The speed is very high.`)
           if (this.shredderTorqueRating.value == 1 || this.shredderTorqueRating.value == 2) {
            hints.push(`You need to use a higher gear reduction.`)
          }
          if (this.shredderTorqueRating.value == 3 || this.shredderTorqueRating.value == 4) {
            hintTitle = "Fair 🙂"
          }
          break
      }

      return new Hint(hintTitle, hints.join("\n"), hintEmoji)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
div.container {
  width: 640pt;
  margin: 0 auto;
}

div.calculator {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

section {
  box-sizing: border-box;
  border: 1pt solid #ededed;
  padding: 10pt;
  width: 45%;
}

label {
  font-size: 120%;
  display: block;
}
input {
  display: block;
}

p.input-hint {
  padding: 0 0 0 0;
  margin: 0;
  font-size: 95%;
  color: #777;
}

dt {
  font-size: 130%;
  font-weight: bold;
  text-transform: uppercase;
}
dd {
  font-size: 200%;
  font-weight: bold;
}

.hint-body{
  font-size: 130%;
}

pre {
  text-align: center;
}
</style>
