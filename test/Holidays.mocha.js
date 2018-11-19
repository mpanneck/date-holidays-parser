/* global describe, it */

'use strict'

require('core-js/es6') // for IE11

const assert = require('assert')
const Holidays = require('../src')
const { toIso, localDate, moveToTimezone } = require('./helpers')

const fixtures = {
  holidays: require('./fixtures/holidays.json'),
  custom: require('./fixtures/custom.json'),
  refs: require('./fixtures/refs.json')
}

describe('#Holidays', function () {
  describe('creation', function () {
    it('throws if instantiating without data', function () {
      assert.throws(() => {
        const hd = new Holidays() // eslint-disable-line no-unused-vars
      }, /need holiday data/)
    })

    it('can set opts without given country', function () {
      const hd = new Holidays(fixtures.custom, { timezone: 'UTC' })
      assert.strictEqual(hd.__timezone, 'UTC')
    })
  })

  describe('can query', function () {
    it('for countries', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.getCountries()
      assert.ok(typeof res === 'object')
      assert.strictEqual(res.DE, 'Deutschland')
    })

    it('for states of a country', function () {
      var hd = Holidays(fixtures.holidays)
      var res = hd.getStates('de')
      var exp = {
        BB: 'Brandenburg',
        BE: 'Berlin',
        BW: 'Baden Würtemberg',
        BY: 'Bayern',
        HB: 'Hansestadt Bremen',
        HE: 'Hessen',
        HH: 'Hansestadt Hamburg',
        MV: 'Mecklenburg Vorpommern',
        NI: 'Niedersachsen',
        NW: 'Nordrhein-Westfalen',
        RP: 'Rheinland-Pfalz',
        SH: 'Schleswig-Holstein',
        SL: 'Saarland',
        SN: 'Sachsen',
        ST: 'Sachsen-Anhalt',
        TH: 'Thüringen'
      }
      assert.deepStrictEqual(res, exp)
    })

    it('for states of a country in french', function () {
      var hd = Holidays(fixtures.holidays)
      var res = hd.getStates('ch', 'fr')
      assert.strictEqual(res.ZH, 'Canton de Zurich')
    })

    it('for regions', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.getRegions('de', 'by')
      var exp = {
        A: 'Stadt Augsburg',
        EVANG: 'Überwiegend evangelische Gemeinden'
      }
      assert.deepStrictEqual(res, exp)
    })

    it('and get list of regions names in default language', function () {
      var res = new Holidays(fixtures.holidays).getRegions('de', 'by')
      assert.deepStrictEqual(res, {
        A: 'Stadt Augsburg',
        EVANG: 'Überwiegend evangelische Gemeinden'
      })
    })

    it('for timezones', function () {
      var hd = new Holidays(fixtures.holidays, 'US')
      var res = hd.getTimezones()
      var exp = [
        'America/New_York',
        'America/Detroit',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Indiana/Indianapolis',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Vevay',
        'America/Chicago',
        'America/Indiana/Tell_City',
        'America/Indiana/Knox',
        'America/Menominee',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/North_Dakota/Beulah',
        'America/Denver',
        'America/Boise',
        'America/Phoenix',
        'America/Los_Angeles',
        'America/Metlakatla',
        'America/Anchorage',
        'America/Juneau',
        'America/Sitka',
        'America/Yakutat',
        'America/Nome',
        'America/Adak',
        'Pacific/Honolulu'
      ]
      assert.deepStrictEqual(res, exp)
    })

    it('for languages', function () {
      var hd = new Holidays(fixtures.holidays, 'BE')
      var res = hd.getLanguages()
      var exp = ['fr', 'nl', 'de', 'en']
      assert.deepStrictEqual(res, exp)
    })

    it('for languages with no country set', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.getLanguages()
      var exp = [ 'en' ]
      assert.deepStrictEqual(res, exp)
    })

    it('for languages after init', function () {
      var hd = new Holidays(fixtures.holidays)
      hd.init('BE')
      var res = hd.getLanguages()
      var exp = ['fr', 'nl', 'de', 'en']
      assert.deepStrictEqual(res, exp)
    })

    it('for dayoff', function () {
      var hd = new Holidays(fixtures.holidays, 'BE')
      var res = hd.getDayOff()
      var exp = 'sunday'
      assert.strictEqual(res, exp)
    })

    it('for dayoff with no country set', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.getDayOff()
      var exp
      assert.strictEqual(res, exp)
    })

    it('for all countries', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.query()
      assert.ok(typeof res === 'object')
      assert.strictEqual(res.AT, 'Österreich')
    })

    it('for all states of AT', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.query('AT')
      assert.ok(typeof res === 'object')
      assert.strictEqual(res['1'], 'Burgenland')
    })

    it('for all regions of DE BY', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.query('DE', 'BY')
      assert.ok(typeof res === 'object')
      assert.strictEqual(res.A, 'Stadt Augsburg')
    })

    it('for all regions of de-', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.query('de-by')
      assert.ok(typeof res === 'object')
      assert.strictEqual(res.A, 'Stadt Augsburg')
    })
  })

  describe('can set', function () {
    it('a custom holiday on 06-22', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.setHoliday('06-22')
      assert.ok(res)
      res = hd.isHoliday(localDate('2011-06-22 00:00'))
      var exp = {
        date: '2011-06-22 00:00:00',
        start: localDate('2011-06-22 00:00'),
        end: localDate('2011-06-23 00:00'),
        name: '06-22',
        type: 'public'
      }
      assert.ok(res)
      assert.deepStrictEqual(res, exp)
    })

    it('a birthday', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.setHoliday('06-22', 'someones birthday')
      assert.ok(res)
      res = hd.isHoliday(localDate('2011-06-22 00:00'))
      var exp = {
        date: '2011-06-22 00:00:00',
        start: localDate('2011-06-22 00:00'),
        end: localDate('2011-06-23 00:00'),
        name: 'someones birthday',
        type: 'public'
      }
      assert.ok(res)
      assert.deepStrictEqual(res, exp)
    })

    it('a holiday to false such removing', function () {
      var hd = new Holidays(fixtures.holidays, 'it')
      hd.setHoliday('01-01', false)
      assert.ok(!hd.holidays['01-01'])
    })

    it('throws if setting a holiday with false .active array', function () {
      var hd = new Holidays(fixtures.holidays, 'it')
      assert.throws(
        () => {
          hd.setHoliday('01-07', {
            name: 'throws',
            active: { from: 2010, to: 2015 }
          })
        }, /\.active is not of type Array: 01-07/
      )
      // assert.ok(!hd.holidays['01-01'])
    })

    it('throws if setting a holiday with .active array but missing prop', function () {
      var hd = new Holidays(fixtures.holidays, 'it')
      assert.throws(
        () => {
          hd.setHoliday('01-07', {
            name: 'throws',
            active: [{ to: '2000' }, {}]
          })
        }, /\.active needs .from or .to property: 01-07/
      )
      // assert.ok(!hd.holidays['01-01'])
    })

    it('can set a holiday with .active array', function () {
      var hd = new Holidays(fixtures.holidays, 'it')
      hd.setHoliday('01-07', {
        name: { it: 'ok' },
        type: 'optional',
        active: [{ to: 2001 }, { from: 2010, to: 2015 }, { from: 2017 }]
      })
      assert.ok(hd.isHoliday(new Date('2000-01-07')))
      assert.ok(!hd.isHoliday(new Date('2001-01-07')))
      assert.ok(hd.isHoliday(new Date('2010-01-07')))
      assert.ok(!hd.isHoliday(new Date('2015-01-07')))
      assert.ok(!hd.isHoliday(new Date('2016-01-07')))
      assert.ok(hd.isHoliday(new Date('2020-01-07')))
    })
  })

  describe('can not set', function () {
    it('a holiday with wrong grammar', function () {
      var hd = new Holidays(fixtures.holidays)
      var res = hd.setHoliday('bad-06-22')
      assert.ok(!res)
    })

    it('an undefined holiday to false', function () {
      var hd = new Holidays('it')
      var res = hd.setHoliday('13-01', false)
      assert.ok(!res)
    })
  })

  describe('can get list of holidays', function () {
    var expDE2015En = {
      'New Year\'s Day': 'thu 2015-01-01 00:00',
      'Women\'s Carnival Day': 'thu 2015-02-12 00:00',
      'Valentine\'s Day': 'sat 2015-02-14 00:00',
      'Shrove Monday': 'mon 2015-02-16 00:00',
      'Shrove Tuesday': 'tue 2015-02-17 14:00',
      'Ash Wednesday': 'wed 2015-02-18 00:00',
      'Maundy Thursday': 'thu 2015-04-02 00:00',
      'Good Friday': 'fri 2015-04-03 00:00',
      'Easter Sunday': 'sun 2015-04-05 00:00',
      'Easter Monday': 'mon 2015-04-06 00:00',
      'Labour Day': 'fri 2015-05-01 00:00',
      'Mother\'s Day': 'sun 2015-05-10 00:00',
      'Ascension Day': 'thu 2015-05-14 00:00',
      'Pentecost': 'sun 2015-05-24 00:00',
      'Whit Monday': 'mon 2015-05-25 00:00',
      'National Holiday': 'sat 2015-10-03 00:00',
      'All Saints\' Day': 'sun 2015-11-01 00:00',
      'All Souls\' Day': 'mon 2015-11-02 00:00',
      'Saint Martin': 'wed 2015-11-11 00:00',
      'Day of Prayer and Repentance': 'wed 2015-11-18 00:00',
      'Memorial Day': 'sun 2015-11-15 00:00',
      'Totensonntag': 'sun 2015-11-22 00:00',
      'Christmas Eve': 'thu 2015-12-24 14:00',
      'Christmas Day': 'fri 2015-12-25 00:00',
      'Boxing Day': 'sat 2015-12-26 00:00',
      'New Year\'s Eve': 'thu 2015-12-31 14:00'
    }

    it('for current year', function () {
      var hd = new Holidays(fixtures.holidays, 'at')
      var res = hd.getHolidays()[0]
      var str = localDate((new Date()).getFullYear() + '-01-01 00:00:00')
      var exp = moveToTimezone(new Date(str), 'Europe/Vienna')
      assert.strictEqual(toIso(res.start), toIso(exp))
    })

    it('for year 2016 using a string', function () {
      var hd = new Holidays(fixtures.holidays, 'at')
      var res = hd.getHolidays('2016')[0]
      var str = '2016-01-01 00:00:00'
      var exp = moveToTimezone(localDate(str), 'Europe/Vienna')
      assert.strictEqual(toIso(res.start), toIso(exp))
    })

    it('for year 2016 using a number', function () {
      var hd = new Holidays(fixtures.holidays, 'at')
      var res = hd.getHolidays(2016)[0]
      var str = '2016-01-01 00:00:00'
      var exp = moveToTimezone(localDate(str), 'Europe/Vienna')
      assert.strictEqual(toIso(res.start), toIso(exp))
    })

    it('of non-duplicated public German/BW holidays for 2017', function () {
      var hd = new Holidays(fixtures.holidays, 'DE', 'bw')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.getHolidays(2017)
      var tmp = {}
      res.forEach(function (p) {
        if (tmp[p.name]) {
          assert.ok(false, p.name + ' is duplicated')
        }
        if (p.name === 'Reformationstag') {
          assert.strictEqual(p.type, 'public') // is public not school!
        }
        tmp[p.name] = true
      })
    })

    it('of German holidays for 2015', function () {
      var hd = new Holidays(fixtures.holidays, 'de')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.getHolidays(2015)
      var tmp = {}
      var exp = {
        'Neujahr': 'thu 2015-01-01 00:00',
        'Valentinstag': 'sat 2015-02-14 00:00',
        'Weiberfastnacht': 'thu 2015-02-12 00:00',
        'Rosenmontag': 'mon 2015-02-16 00:00',
        'Faschingsdienstag': 'tue 2015-02-17 14:00',
        'Aschermittwoch': 'wed 2015-02-18 00:00',
        'Gründonnerstag': 'thu 2015-04-02 00:00',
        'Karfreitag': 'fri 2015-04-03 00:00',
        'Ostersonntag': 'sun 2015-04-05 00:00',
        'Ostermontag': 'mon 2015-04-06 00:00',
        'Maifeiertag': 'fri 2015-05-01 00:00',
        'Christi Himmelfahrt': 'thu 2015-05-14 00:00',
        'Pfingstsonntag': 'sun 2015-05-24 00:00',
        'Pfingstmontag': 'mon 2015-05-25 00:00',
        'Tag der Deutschen Einheit': 'sat 2015-10-03 00:00',
        'Allerheiligen': 'sun 2015-11-01 00:00',
        'Allerseelen': 'mon 2015-11-02 00:00',
        'Sankt Martin (Faschingsbeginn)': 'wed 2015-11-11 00:00',
        'Buß- und Bettag': 'wed 2015-11-18 00:00',
        'Volkstrauertag': 'sun 2015-11-15 00:00',
        'Totensonntag': 'sun 2015-11-22 00:00',
        'Heiliger Abend': 'thu 2015-12-24 14:00',
        '1. Weihnachtstag': 'fri 2015-12-25 00:00',
        '2. Weihnachtstag': 'sat 2015-12-26 00:00',
        'Silvester': 'thu 2015-12-31 14:00',
        'Muttertag': 'sun 2015-05-10 00:00'
      }

      res.forEach(function (p) {
        tmp[p.name] = toIso(p.start)
      })
      // console.log(tmp)
      assert.deepStrictEqual(tmp, exp)
    })

    it('of public German holidays for 2015', function () {
      var hd = new Holidays(fixtures.holidays, 'de', { types: ['public'] })
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.getHolidays(2015)
      var tmp = {}
      var exp = {
        Neujahr: 'thu 2015-01-01 00:00',
        Karfreitag: 'fri 2015-04-03 00:00',
        Ostermontag: 'mon 2015-04-06 00:00',
        Maifeiertag: 'fri 2015-05-01 00:00',
        'Christi Himmelfahrt': 'thu 2015-05-14 00:00',
        Pfingstmontag: 'mon 2015-05-25 00:00',
        'Tag der Deutschen Einheit': 'sat 2015-10-03 00:00',
        '1. Weihnachtstag': 'fri 2015-12-25 00:00',
        '2. Weihnachtstag': 'sat 2015-12-26 00:00'
      }

      res.forEach(function (p) {
        tmp[p.name] = toIso(p.start)
      })
      // console.log(tmp)
      assert.deepStrictEqual(tmp, exp)
    })

    it('of German holidays for 2015 in english', function () {
      var hd = new Holidays(fixtures.holidays, 'de', { languages: ['en'] })
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.getHolidays(2015)
      var tmp = {}
      var exp = expDE2015En

      res.forEach(function (p) {
        tmp[p.name] = toIso(p.start)
      })
      // console.log(tmp)
      assert.deepStrictEqual(tmp, exp)
    })

    it('of German holidays for 2015 in english #2', function () {
      var hd = new Holidays(fixtures.holidays, 'de')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.getHolidays(2015, 'en')
      var tmp = {}
      var exp = expDE2015En

      res.forEach(function (p) {
        tmp[p.name] = toIso(p.start)
      })
      // console.log(tmp)
      assert.deepStrictEqual(tmp, exp)
    })

    it('of German holidays for 2015 in english #3', function () {
      var hd = new Holidays(fixtures.holidays, 'de')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      hd.setLanguages('en')
      var res = hd.getHolidays(2015)
      var tmp = {}
      var exp = expDE2015En

      res.forEach(function (p) {
        tmp[p.name] = toIso(p.start)
      })
      // console.log(tmp)
      assert.deepStrictEqual(tmp, exp)
    })
  })

  describe('can check', function () {
    it('if now is a holiday in France without exception', function () {
      var hd = new Holidays(fixtures.holidays, 'fr')
      assert.doesNotThrow(() => {
        hd.isHoliday()
      })
    })

    it('if 2015-01-01 is a holiday in Spain and return `Año Nuevo`', function () {
      var hd = new Holidays(fixtures.holidays, 'es')
      var res = hd.isHoliday(new Date('2015-01-01T12:00'))
      assert.strictEqual(res.name, 'Año Nuevo')
    })

    it('if 2015-01-01 is holiday in Iceland', function () {
      var hd = new Holidays(fixtures.holidays, 'is')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(new Date('2015-01-01'))
      assert.ok(res)
    })

    it('if 2015-12-26 is substitute holiday in UK', function () {
      var hd = new Holidays(fixtures.holidays, 'gb')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(new Date('2015-12-28'))
      assert.ok(res)
      assert.strictEqual(res.substitute, true)
      assert.strictEqual(res.name, 'Boxing Day (substitute day)')
    })

    it('if 2013-12-31:10:00 is yet not a holiday in Germany', function () {
      var hd = new Holidays(fixtures.holidays, 'de.th')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(localDate('2013-12-31 10:00'))
      assert.ok(!res)
    })

    it('if 2014-12-31:14:00 is a holiday in Germany Thüringen', function () {
      var hd = new Holidays(fixtures.holidays, 'de.th')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(localDate('2014-12-31 14:00'))
      assert.ok(res)
    })

    it('if 2017-12-24:16:00 is a holiday in Germany', function () {
      var hd = new Holidays(fixtures.holidays, 'de', { observance: true })
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(localDate('2017-12-24 16:00'))
      assert.ok(res)
    })

    it('if 2017-12-24:16:00 is a holiday in Germany Brandenburg', function () {
      var hd = new Holidays(fixtures.holidays, 'de', 'bb', { observance: true })
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(localDate('2017-12-24 16:00'))
      assert.ok(res)
    })

    it('if Festa Nazionale 2011 was a holiday in Italy', function () {
      var hd = new Holidays(fixtures.holidays, 'it')
      hd.setTimezone() // use local time to pass tests in other timezone other than `Europe/Berlin`
      var res = hd.isHoliday(localDate('2011-03-17 00:00'))
      assert.ok(res)
      assert.strictEqual(res.name, 'Festa Nazionale 2011')
    })

    it('if 2015-12-07 can be disabled', function () {
      var hd = new Holidays(fixtures.holidays)
      hd.setHoliday('1st monday after 12-01', {
        disable: ['2015-12-07'],
        name: {
          en: 'test'
        },
        type: 'public'
      })
      var res = hd.isHoliday(localDate('2015-12-07 00:00'))
      assert.ok(!res)
    })

    it('if 2015-12-07 can be disabled and moved to 2015-12-05', function () {
      var hd = new Holidays(fixtures.holidays)
      hd.setHoliday('1st monday after 12-01', {
        disable: ['2015-12-07'],
        enable: ['2015-12-05'],
        name: {
          en: 'test'
        },
        type: 'public'
      })
      var d = localDate('2015-12-05 00:00')
      var res = hd.isHoliday(d)
      assert.strictEqual(toIso(res.start), 'sat 2015-12-05 00:00')
      assert.strictEqual(toIso(res.end), 'sun 2015-12-06 00:00')
    })

    it('if 2015-12-07 can not be disabled for 2016', function () {
      var hd = new Holidays(fixtures.holidays)
      hd.setHoliday('1st monday after 12-01', {
        disable: ['2015-12-07'],
        enable: ['2015-12-05'],
        name: {
          en: 'test'
        },
        type: 'public'
      })
      var d = localDate('2016-12-05 00:00')
      var res = hd.isHoliday(d)
      assert.strictEqual(toIso(res.start), 'mon 2016-12-05 00:00')
      assert.strictEqual(toIso(res.end), 'tue 2016-12-06 00:00')
    })
  })

  describe('custom data', function () {
    var hd = new Holidays(fixtures.custom, 'custom')

    it('can get list of holidays', function () {
      var exp = [
        { date: '2017-01-01 00:00:00',
          start: localDate('2017-01-01 00:00'),
          end: localDate('2017-01-02 00:00'),
          name: 'New Year',
          type: 'public' },
        { date: '2017-05-01 00:00:00',
          start: localDate('2017-05-01 00:00'),
          end: localDate('2017-05-06 00:00'),
          name: 'Laybour Day',
          type: 'public' },
        { date: '2017-12-25 00:00:00',
          start: localDate('2017-12-25 00:00'),
          end: localDate('2017-12-26 00:00:00'),
          name: 'Christmas',
          type: 'public' }
      ]
      var list = hd.getHolidays(2017)
      assert.deepStrictEqual(list, exp)
    })
  })
})
