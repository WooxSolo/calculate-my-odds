
export class Validator {
    private validationFuncs: (() => boolean)[] = [];
    
    addValidation(func: () => boolean) {
        this.validationFuncs.push(func);
    }
    
    removeValidation(func: () => boolean) {
        this.validationFuncs = this.validationFuncs.filter(x => x !== func);
    }
    
    validate() {
        for (const func of this.validationFuncs) {
            if (!func()) {
                return false;
            }
        }
        return true;
    }
}
