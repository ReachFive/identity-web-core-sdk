import * as random from '../../../utils/random'

const mockRandom = jest.spyOn(random, 'randomBase64String')

const values = [
  "Ia1rkizOVYBvyV6ha04f",
  "qPn4iE01SiRNIp0G2wGf",
  "cCJt4cQL7hhmvMs2jK6Z",
  "qPIjxN7fQBJH7jaB6vMo",
  "TlVy5SAgobgzWuqLYbkT",
  "CKk9HfTljnkeZao83sHB",
  "b94PqgCC5WK826YXMQKz",
  "1KSsaVh9Og1Y8mAOjAJP",
  "DGDo700J17dfxz9A2bBw",
  "hRBrAMQBDb1Uk1aY2ZYl",
  "DTHoGl6HIihhSp1RKxxk",
  "CT4tuLO0lCzKwJK2tmcm",
  "u623FSLvfpDVmT8DNgzG",
  "vdgqYhJEexaWCrQblhtQ",
  "axeWZ2SwjDWNFEwrMN6i",
  "ej072ggNvikF9pO92hC5",
  "lfxcFa6Y6wo5FKmWhC0A",
  "PsoTNu52KPU1iv6lfRif",
  "Agj25ULLBAfAlsTQxZBg",
  "Od9VaPa0cZNS9QtMZCOx",
  "cojQvCAfwvV6Td0f7n3r",
  "g0FFqv7XnUJhiGhDlAm4",
  "cjV4Es11gV1LrF73BjOp",
  "iPXSWFrHCcqUHNaEMHiI",
  "SJbhD9aDwj0T7Nu9PDeh",
  "RIZupiCJANyVjpKdFMxk",
  "dCQJwGL1Vcr1ZguP2fRA",
  "yZIeXLxHSS2MmdFh5VXH",
  "hzS5HVGdwNE8NKTx2I44",
  "yETTaRvKCF4NI9UeCJkn",
  "HTsKpcjz8YyX3GLOMIqu",
  "TGow6lYj2ZfzTrcw3MF2",
  "hahj3IWiG78kB8kkphcg",
  "D6FdDA8s0juAz5Qqc9LU",
  "HwLAfpOjxWfd3irxnYJE",
  "zQWgA8IZcj5IN5Yue03s",
  "zerj1UPOjXT8DFKAKnFF",
  "KrQPzIBye2w5qSSL4xAZ",
  "r8htN86N3EivsgLd7fSk",
  "rs2rQLkHtRRMYLqcaR43",
  "KuW6xKTcoa1BksE8AtLZ",
  "zkUtomCYqtHt2GXv2YLy",
  "FEz8RFlXdmc0SiiFMBgm",
  "N1WiXlkFAESCt41M8bsK",
  "V8uqfPCJPCEvtcJHy9EV",
  "vpOqpbjIyXs7R7oGBLpD",
  "NCZgD58nJTDB8VG2XwzJ",
  "Ulv3fYPVAHDv80wzmBlR",
  "YMHDLE1Xe2SJ4k6Kw46T",
  "Nls0BPIiUyNATd6q64I7",
]

export function mockNextRandom(value: string) {
  mockRandom.mockReturnValue(value)
}

export function popNextRandomString(): string {
  const nextValue = values.pop() || "out-of-random-values"
  mockRandom.mockReturnValue(nextValue)

  return nextValue
}
