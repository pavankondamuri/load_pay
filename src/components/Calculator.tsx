import { useReducer, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CalculatorState {
  displayValue: string;
  firstOperand: number | null;
  operator: string | null;
  waitingForSecondOperand: boolean;
}

const initialState: CalculatorState = {
  displayValue: '0',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
};

type Action =
  | { type: 'INPUT_DIGIT'; payload: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'HANDLE_OPERATOR'; payload: string }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR_ALL' }
  | { type: 'BACKSPACE' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'APPLY_PERCENTAGE' };

const calculate = (first: number, second: number, op: string): number => {
  switch (op) {
    case '+': return first + second;
    case '-': return first - second;
    case '*': return first * second;
    case '/':
      if (second === 0) return NaN;
      return first / second;
    default: return second;
  }
};

function calculatorReducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT':
      if (state.waitingForSecondOperand) {
        return { ...state, displayValue: action.payload, waitingForSecondOperand: false };
      }
      return { ...state, displayValue: state.displayValue === '0' ? action.payload : state.displayValue + action.payload };
    
    case 'INPUT_DECIMAL':
        if (state.waitingForSecondOperand) {
            return { ...state, displayValue: '0.', waitingForSecondOperand: false };
        }
        if (!state.displayValue.includes('.')) {
            return { ...state, displayValue: state.displayValue + '.' };
        }
        return state;

    case 'HANDLE_OPERATOR': {
      const inputValue = parseFloat(state.displayValue);

      if (state.operator && state.waitingForSecondOperand) {
        return { ...state, operator: action.payload };
      }

      if (state.firstOperand === null) {
        return { ...state, firstOperand: inputValue, waitingForSecondOperand: true, operator: action.payload };
      } else if (state.operator) {
        const result = calculate(state.firstOperand, inputValue, state.operator);
        if (isNaN(result)) {
            return { ...initialState, displayValue: 'Error' };
        }
        const roundedResult = Math.round(result * 10000) / 10000;
        return {
          ...state,
          displayValue: String(roundedResult),
          firstOperand: roundedResult,
          waitingForSecondOperand: true,
          operator: action.payload,
        };
      }
      return state;
    }

    case 'CALCULATE': {
        if (state.operator && state.firstOperand !== null) {
            const inputValue = parseFloat(state.displayValue);
            let result = calculate(state.firstOperand, inputValue, state.operator);
            if (isNaN(result)) {
                return { ...initialState, displayValue: 'Error' };
            }
            result = Math.round(result * 10000) / 10000;
            return {
                ...initialState,
                displayValue: String(result),
            };
        }
        return state;
    }

    case 'CLEAR_ALL':
      return initialState;

    case 'BACKSPACE':
        if (state.displayValue === 'Error' || (state.displayValue.length === 1 && state.displayValue !== '0')) {
            return initialState;
        }
        if (state.displayValue !== '0') {
            return { ...state, displayValue: state.displayValue.slice(0, -1) || '0' };
        }
        return state;
      
    case 'TOGGLE_SIGN':
        if (state.displayValue === '0' || state.displayValue === 'Error') {
            return state;
        }
        return { ...state, displayValue: String(parseFloat(state.displayValue) * -1) };

    case 'APPLY_PERCENTAGE':
        if (state.displayValue === 'Error') {
            return state;
        }
        return { ...state, displayValue: String(parseFloat(state.displayValue) / 100) };

    default:
      return state;
  }
}

export function Calculator() {
  const [{ displayValue }, dispatch] = useReducer(calculatorReducer, initialState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        if (!event.target.readOnly) {
          return;
        }
      }
      event.preventDefault();
      const { key } = event;
      if (key >= '0' && key <= '9') {
        dispatch({ type: 'INPUT_DIGIT', payload: key });
      } else if (key === '.') {
        dispatch({ type: 'INPUT_DECIMAL' });
      } else if (['+', '-', '*', '/'].includes(key)) {
        dispatch({ type: 'HANDLE_OPERATOR', payload: key });
      } else if (key === 'Enter' || key === '=') {
        dispatch({ type: 'CALCULATE' });
      } else if (key === 'Backspace') {
        dispatch({ type: 'BACKSPACE' });
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        dispatch({ type: 'CLEAR_ALL' });
      } else if (key === '%') {
        dispatch({ type: 'APPLY_PERCENTAGE' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const buttons = [
    { value: 'C', handler: () => dispatch({ type: 'CLEAR_ALL' }), variant: 'destructive', className: 'col-span-1' },
    { value: '←', handler: () => dispatch({ type: 'BACKSPACE' }), variant: 'outline' },
    { value: '%', handler: () => dispatch({ type: 'APPLY_PERCENTAGE' }), variant: 'outline' },
    { value: '/', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '/' }), variant: 'outline' },
    
    { value: '7', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '7' }), variant: 'outline' },
    { value: '8', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '8' }), variant: 'outline' },
    { value: '9', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '9' }), variant: 'outline' },
    { value: '*', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '*' }), variant: 'outline' },
    
    { value: '4', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '4' }), variant: 'outline' },
    { value: '5', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '5' }), variant: 'outline' },
    { value: '6', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '6' }), variant: 'outline' },
    { value: '-', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '-' }), variant: 'outline' },

    { value: '1', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '1' }), variant: 'outline' },
    { value: '2', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '2' }), variant: 'outline' },
    { value: '3', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '3' }), variant: 'outline' },
    { value: '+', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '+' }), variant: 'outline' },
    
    { value: '+/-', handler: () => dispatch({ type: 'TOGGLE_SIGN' }), variant: 'outline' },
    { value: '0', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '0' }), variant: 'outline' },
    { value: '.', handler: () => dispatch({ type: 'INPUT_DECIMAL' }), variant: 'outline' },
    { value: '=', handler: () => dispatch({ type: 'CALCULATE' }), variant: 'default', className: 'col-span-1' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          readOnly
          value={displayValue}
          className="text-right text-3xl font-mono h-16 mb-4"
        />
        <div className="grid grid-cols-4 gap-2">
            {buttons.map(({ value, handler, variant, className }) => (
                <Button
                    key={value}
                    onClick={handler}
                    variant={variant as any}
                    className={className}
                >
                    {value}
                </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
} 