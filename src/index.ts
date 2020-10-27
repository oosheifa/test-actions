/**
 * Module: ...
 *
 */

/**
 * Value: ...
 *
 */
export const myValue = "3.124";

/**
 * Interface: ...
 *
 */
export interface IMyClass {

    /**
     * Member: ...
     *
     */
    myValue: string;

    /**
     * Method: ...
     *
     */
    myMethod(): boolean;
}

/**
 * Class: ...
 *
 */
export class MyClass {


    /**
     * Member: ...
     *
     */
    public myValue: string;


    /**
     * Constructor: ...
     *
     */
    constructor (options: {myValue: string}) {

      this.myValue = options.myValue;

    }


    /**
     * Method: ...
     *
     */
    public myMethod (): boolean {

      return false;

    }

    public foof (): void {
      return;
    }

}

/**
 * Function: ...
 *
 */
export function myFunction(): number {

  return 0;

}
