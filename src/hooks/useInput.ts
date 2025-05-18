import { ChangeEvent, useState } from "react";

const useInput = (defaultValue: any) => {
	const [value, setValue] = useState<any>(defaultValue);

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	}

	return {value, onChange}
}

export default useInput;