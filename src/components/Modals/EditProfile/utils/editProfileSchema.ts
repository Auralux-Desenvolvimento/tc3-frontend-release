import { ObjectShape } from 'yup/lib/object';
import * as Yup from 'yup';

export default function editProfileSchema (fields: ObjectShape = {}) {
  fields.password = Yup.string()
    .required("Senha obrigatória")
    .min(8, 'Mínimo de 8 caracteres')
    .max(30, 'Máximo de 30 caracteres')
  const schema = Yup.object().shape(fields);
  return schema;
}