import { FormikErrors, FormikTouched } from "formik";
import editProfileSchema from "./editProfileSchema";
import * as yup from 'yup';

export default async function yupPasswordCheck (
  password: string,
  setTouched: (touched: FormikTouched<any>, shouldValidate?: boolean | undefined) => void,
  setErrors: (errors: FormikErrors<any>) => void
) {
  try {
    await editProfileSchema().validate({ password }, {
      abortEarly: false
    });
  } catch (rawError) {
    const error: yup.ValidationError = rawError as any;
    for (let e of error.inner) {
      switch (e.path) {
        case "password":
          setTouched({
            password: true
          }, true)
          setErrors({ password: e.message });
          return false;
      }
    }
  }
  return true;
}