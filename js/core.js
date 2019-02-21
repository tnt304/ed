function Core() {
    let split = (input, i) => (input.search(" ") !== -1 ? input.split(" ") : input.match(new RegExp(`.{${i}}`, "g")))
        || [input];

    this.getInstance = (script) => {
        switch (script) {
            case "binary":
                return this.binary;
            case "hex":
                return this.hex;
            case "base64":
                return this.base64;
            case "uri":
                return this.uri;
            case "viet":
                return this.newVietnamese;
        }
    };

    this.binary = (() => {
        return {
            id: "bin",
            valid: input => /^(?:[01]{1,8}\s*)+$/.test(input.replace(/\s/g, "")),
            de: input => {
                const arr = split(input, 8);
                let finalStr = "";
                for (let i = 0; i < arr.length; i++) {
                    finalStr += String.fromCharCode(parseInt(arr[i], 2));
                }
                return finalStr;
            },
            en: input => {
                const output = [];
                const pad = "00000000";
                for (let i = 0; i < input.length; i++) {
                    const str = input[i].charCodeAt(0).toString(2);
                    output.push(pad.substring(0, pad.length - str.length) + str);
                }
                return output.join(" ");
            }
        }
    })();

    this.hex = (() => {
        return {
            id: "hex",
            valid: input => /^(?:[0-9A-Fa-f]{2}\s*)+$/.test(input),
            de: input => {
                const s = split(input, 2);
                let str = "";
                for (let i = 0; i < s.length; i++) {
                    str += String.fromCharCode(parseInt(s[i], 16));
                }
                let s_cape = window.escape || encodeURIComponent;
                try {
                    return decodeURIComponent(s_cape(str));
                } catch (e) {
                    return null;
                }
            },
            en: input => {
                input = unescape(encodeURIComponent(input));
                let result = "";
                for (let i = 0; i < input.length; i++) {
                    result += input.charCodeAt(i).toString(16)
                }
                return result.toUpperCase();
            }
        }
    })();

    this.base64 = (() => {
        return {
            id: "b64",
            valid: input => /^([\w+\/]{4})*([\w+\/]{4}|[\w+\/]{3}=|[\w\/]{2}==)$/.test(input.replace(/\s/g, "")),
            de: input => {
                try {
                    return decodeURIComponent(atob(input).split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                } catch (e) {
                    return null;
                }
            }
            ,
            en: input => btoa(encodeURIComponent(input)
                .replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)))
        }
    })();

    this.uri = (() => {
        return {
            id: "uri",
            valid: input => this.uri.de(input) !== null,
            validUrl: input => /^((https?|ftp):\/\/)?\w+([\-.]\w+)*\.[a-z0-9]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(input),
            de: input => {
                try {
                    return decodeURIComponent(input.replace(/\+/g, " "))
                } catch (e) {
                    return null;
                }
            },
            en: input => encodeURIComponent(input).replace(/'/g, "%27").replace(/"/g, "%22")
        }
    })();

    this.newVietnamese = (() => {
        let enMaps = [
            ['kh', 'x'], ['nh', 'n\''], ['c(?!h)', 'k'], ['th', 'w'], ['q', 'k'], ['ngh?', 'q'], ['gh', 'g'],
            ['ph', 'f'], ['tr', 'c'], ['ch', 'c'], ['d', 'z'], ['gi', 'z'], ['r', 'z'], ['đ', 'd']
        ];
        let capitalize = input => `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
        let convert = (input, map) => input.replace(new RegExp(map[0], 'g'), map[1])
            .replace(new RegExp(capitalize(map[0]), 'g'), capitalize(map[1]));

        return {
            id: "vie",
            valid: input => true,
            de: () => {
                // "Bạn đùa à? Cái thứ này thì dịch thế đ** nào được!"
                return null;
            },
            en: input => {
                enMaps.forEach(map => {
                    input = convert(input, map);
                });
                return input;
            }
        }
    })();

    this.decode = (core, input) => {
        input = input.trim();
        if (!core.valid(input)) return null;

        let result = core.de(input);
        result = (this.uri.valid(result)) ? this.uri.de(result) : result

        console.log(`Valid ${core.id} encoded: ${input}`);
        console.log(result);
        return result;
    };

    this.encode = (core, input) => core.en(input.trim());
}
