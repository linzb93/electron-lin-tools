import { omit } from "lodash-es";

interface Params {
  code: number;
  message: string;
}

export default (raw: Params) => {
  return {
    code: raw ? raw.code || 200 : 200,
    message: raw ? raw.message : "",
    result: omit(raw, ["code", "message"]),
  };
};
