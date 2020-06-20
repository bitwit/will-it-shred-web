<template>
  <div class="calculator-container">
    <div class="calculator">
      <section class="inputs">
        <h2>{{shredderInputData.title}} Calculator</h2>
        <h3>⚡️ Motor</h3>
        <div class="type-container">
          <div class="type-headings">
            <h5>Speed</h5>
            <select v-model="rpmType" @change="rpmTypeChanged()">
              <option value="rpm" selected>RPM</option>
              <option value="hzpoles">Hz &amp; Poles</option>
            </select>
          </div>
          <div class="type-inputs">
            <div class="rpm-input" v-if="rpmType == 'rpm'">
              <input type="number" step="1" name="rpm" v-model="motor.rpm" />
              <label for="rpm">RPM</label>
            </div>
            <div class="hz-poles-input" v-if="rpmType == 'hzpoles'">
              <input type="number" step="1" name="hz" v-model="motor.hz" />
              <label for="hz">Hz</label>
              <p class="input-hint">Normally 50 or 60</p>
              <br />
              <input type="number" step="2" name="poles" v-model="motor.poles" />
              <label for="poles">Poles</label>
              <p class="input-hint">An even number such as 2 or 4</p>
            </div>    
          </div>
        </div>
      
        <div class="type-container">
          <div class="type-headings">
            <h5>Power</h5>
            <select v-model="powerType" @change="powerTypeChanged()">
              <option value="kw" selected>Kilowatts</option>
              <option value="w">Watts</option>
              <option value="voltsamps">Voltage &amp; Amps</option>
            </select>
          </div>

          <div class="type-inputs">
            <div class="kw-input" v-if="powerType == 'kw'">
              <input type="number" step="0.1" name="kilowatts" v-model="motor.kilowatts" />
              <label for="kilowatts">kW</label>
            </div>

            <div class="w-input" v-if="powerType == 'w'">
              <input type="number" step="1" name="watts" v-model="motor.watts" />
              <label for="watts">W</label>
            </div>

            <div class="voltsamps-input" v-if="powerType == 'voltsamps'"> 
              <input type="number" step="1" name="volts" v-model="motor.volts" />
              <label for="volts">Volts</label>
              <input type="number" step="0.1" name="amps" v-model="motor.amps" />
              <label for="amps">Amps</label>
            </div>
          </div>
        </div>

        <h3>⚙️ Gearing</h3>
        <div class="type-container">
          <div class="type-headings">
            <h5 class="gear-heading">Gear Ratio (n: 1)</h5>
            <h5 class="gear-heading">Maximum Torque</h5>
          </div>
          <div class="type-inputs">
            <div class="ratio-input">
              <input type="number" step="0.1" name="ratio" v-model="gearing.ratio" placeholder="n" />
            </div>
            <div class="max-torque-input">
              <input type="number" step="0.1" name="maxTorque" v-model="gearing.maxTorque" />
              <label for="maxTorque">nm</label>
            </div>
          </div>
        </div>

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
          <p v-if="gearing.maxTorque != null && gearing.maxTorque > 0 && gearing.maxTorque < shredderTorque">
            ⚠️ WARNING: Torque exceeds gearbox rating. It may break
          </p>
          <p v-if="shredderResultHint != null">
            <a class="share-button" :href="shareResultsUrl">✉ Share these results</a>
          </p>
        </div>
      </section>
    </div>
    <footer>
      <p>Picking the right motor for your Precious Plastic Shredder can be tricky</p>
      <p>Use this calculator to help find out if the motor/gearing combination you are considering will shred within your expectations</p>
      <p class="credit">Will It Shred originally developed in Excel <a href="https://davehakkens.nl/community/forums/topic/will-it-shred/" target="_blank">by Andy Noyes</a></p>
      <p class="credit">Transcribed for web by <a href="https://twitter.com/kylnew" target="_blank">Kyle Newsome</a></p>
      <p class="credit"><a href="https://github.com/bitwit/will-it-shred-web" target="_blank">Contribute on Github</a></p>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ShredderInputData, RatingResult, getRating } from '../DataStructure'

class MotorData {
  rpm: number | null = null

  hz: number | null = null
  poles: number | null = null

  kilowatts: number | null = null
  watts: number | null = null

  volts: number | null = null
  amps: number | null = null
}

class GearingData {
  ratio?: number
  maxTorque?: number
  efficiency: number = 0.75
}

interface JSONDataInput {
  rpm?: number
  kilowatts?: number
  gearRatio?: number
  maxTorque?: number
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
    let params = new URLSearchParams(window.location.search);
      let jsonInput = params.get("jsonInput")
      if (jsonInput) {
        let parsedJSON = JSON.parse(jsonInput) as JSONDataInput;
        console.log(parsedJSON);
        if(parsedJSON.rpm) {
          this.motor.rpm = parsedJSON.rpm
        }
        if(parsedJSON.kilowatts) {
          this.motor.kilowatts = parsedJSON.kilowatts
        }
        if(parsedJSON.gearRatio) {
          this.gearing.ratio = parsedJSON.gearRatio
        }
        if(parsedJSON.maxTorque) {
          this.gearing.maxTorque = parsedJSON.maxTorque
        }
      }
    console.log("Calculator created", this.shredderInputData)
  },
  data: function () { 
    return {
      rpmType: "rpm",
      powerType: "kw",
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
    },
    shareResultsUrl: function() {
      let data = {
        rpm: this.getComputedMotorRPM(),
        kilowatts: (this.getComputedMotorWatts()! / 1000),
        gearRatio: this.gearing.ratio,
        maxTorque: this.gearing.maxTorque
      }
      let encodedData = encodeURIComponent(JSON.stringify(data))
      return `${window.location.origin}/?jsonInput=${encodedData}`
    },
  },
  methods: {
    rpmTypeChanged: function () {
      this.motor.rpm = null
      this.motor.hz = null
      this.motor.poles = null
    },

    powerTypeChanged: function () {
      this.motor.kilowatts = null
      this.motor.watts = null
      this.motor.volts = null
      this.motor.amps = null
    },

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
        return this.motor.volts * this.motor.amps * 0.8
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
          hints.push(`The torque is low.`)
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

.type-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 20pt;
}
.type-headings {
  width: 50%;
}
.type-inputs {
  width: 50%;
}

.gear-heading:nth-child(2) {
  margin-top: 40px;
}

.max-torque-input {
  padding-top: 20px;
  clear: both;
}

h5 {
  margin: 0 5pt 0 0;
  float: left;
}

input {
  margin-right: 10px;
  width: 100px;
  display: block;
  float: left;
  font-size: 150%;
}

label {
  font-size: 120%;
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

p.credit {
  font-size: 80%;
  text-align: center;
  margin: 0;
}

@media only screen and (max-width: 639px) {
  div.calculator {
    flex-direction: column;
  }

  section {
    width: 98%;
  }
}
</style>
