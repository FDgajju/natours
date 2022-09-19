const genRandomToken = (n) => {
  const strings = {
    numbers: '0123456789',
    // symbols: '!@#$%&_+-|',
    capLetters: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    smlLetters: 'mnbvcxzlkjhgfdsapoiuytrewq',
  };
  let types = Object.keys(strings);

  let token = '';
  for (let i = 0; i < n; i++) {
    const y = types[Math.round(Math.random() * (types.length - 1))];
    token += strings[y][Math.round(Math.random() * (strings[y].length - 1))];
  }

  return token;
};


module.exports = genRandomToken;
