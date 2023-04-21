export const validateEmail = (email: string) =>
  email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );

export const validatePassword = (password: string) => {
  let result = { isValid: true, error: '' };
  if (password.length < 6) {
    result = { isValid: false, error: 'Tu constraseña debe tener mas de seis caracteres' };
  } else if (password.search(/[a-z]/) < 0) {
    result = { isValid: false, error: 'Tu contraseña debe tener una letra minuscula' };
  } else if (password.search(/[A-Z]/) < 0) {
    result = { isValid: false, error: 'Tu contraseña debe tener una letra mayuscula' };
  } else if (password.search(/[0-9]/) < 0) {
    result = { isValid: false, error: 'Tu contraseña debe tener al menos un número' };
  }

  return result;
};

const uploadFile = (file: File) => {};
