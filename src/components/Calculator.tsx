import { useReducer, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calculator as CalculatorIcon, History, X, RotateCcw, MemoryStick} from 'lucide-react';

interface CalculatorState {
  displayValue: string;
  firstOperand: number | null;
  operator: string | null;
  waitingForSecondOperand: boolean;
  memory: number;
  history: string[];
  isError: boolean;
  expression: string;
}

const initialState: CalculatorState = {
  displayValue: '0',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  memory: 0,
  history: [],
  isError: false,
  expression: '',
};

type Action =
  | { type: 'INPUT_DIGIT'; payload: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'HANDLE_OPERATOR'; payload: string }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR_ALL' }
  | { type: 'CLEAR_ENTRY' }
  | { type: 'BACKSPACE' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'APPLY_PERCENTAGE' }
  | { type: 'SQUARE' }
  | { type: 'SQUARE_ROOT' }
  | { type: 'RECIPROCAL' }
  | { type: 'MEMORY_STORE' }
  | { type: 'MEMORY_RECALL' }
  | { type: 'MEMORY_ADD' }
  | { type: 'MEMORY_SUBTRACT' }
  | { type: 'MEMORY_CLEAR' }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' };

const calculate = (first: number, second: number, op: string): number => {
  switch (op) {
    case '+': return first + second;
    case '-': return first - second;
    case '*': return first * second;
    case '/':
      if (second === 0) return NaN;
      return first / second;
    case '^': return Math.pow(first, second);
    default: return second;
  }
};

const scientificCalculate = (value: number, operation: string): number => {
  switch (operation) {
    case 'square': return value * value;
    case 'sqrt': return Math.sqrt(value);
    case 'reciprocal': return 1 / value;
    default: return value;
  }
};

function calculatorReducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT':
      if (state.isError) {
        return { ...state, displayValue: action.payload, isError: false, expression: action.payload };
      }
      if (state.waitingForSecondOperand) {
        return { ...state, displayValue: action.payload, waitingForSecondOperand: false, expression: state.expression + action.payload };
      }
      const newDisplayValue = state.displayValue === '0' ? action.payload : state.displayValue + action.payload;
      const newExpression = state.operator ? state.expression + action.payload : action.payload;
      return { ...state, displayValue: newDisplayValue, expression: newExpression };
    
    case 'INPUT_DECIMAL':
        if (state.isError) {
            return { ...state, displayValue: '0.', isError: false, expression: '0.' };
        }
        if (state.waitingForSecondOperand) {
            return { ...state, displayValue: '0.', waitingForSecondOperand: false, expression: state.expression + '0.' };
        }
        if (!state.displayValue.includes('.')) {
            const newDisplayValue = state.displayValue + '.';
            const newExpression = state.operator ? state.expression + '.' : state.displayValue + '.';
            return { ...state, displayValue: newDisplayValue, expression: newExpression };
        }
        return state;

    case 'HANDLE_OPERATOR': {
      const inputValue = parseFloat(state.displayValue);
      const operatorSymbol = action.payload === '*' ? '×' : action.payload === '/' ? '÷' : action.payload;

      if (state.operator && state.waitingForSecondOperand) {
        return { ...state, operator: action.payload, expression: state.expression.slice(0, -1) + operatorSymbol };
      }

      if (state.firstOperand === null) {
        return { 
          ...state, 
          firstOperand: inputValue, 
          waitingForSecondOperand: true, 
          operator: action.payload,
          expression: state.displayValue + ' ' + operatorSymbol + ' '
        };
      } else if (state.operator) {
        const result = calculate(state.firstOperand, inputValue, state.operator);
        if (isNaN(result)) {
            return { ...state, displayValue: 'Error', isError: true, expression: '' };
        }
        const roundedResult = Math.round(result * 1000000) / 1000000;
        return {
          ...state,
          displayValue: String(roundedResult),
          firstOperand: roundedResult,
          waitingForSecondOperand: true,
          operator: action.payload,
          expression: String(roundedResult) + ' ' + operatorSymbol + ' '
        };
      }
      return state;
    }

    case 'CALCULATE': {
        if (state.operator && state.firstOperand !== null) {
            const inputValue = parseFloat(state.displayValue);
            let result = calculate(state.firstOperand, inputValue, state.operator);
            if (isNaN(result)) {
                return { ...state, displayValue: 'Error', isError: true, expression: '' };
            }
            result = Math.round(result * 1000000) / 1000000;
            const calculation = `${state.firstOperand} ${state.operator} ${inputValue} = ${result}`;
            return {
                ...state,
                displayValue: String(result),
                firstOperand: null,
                operator: null,
                waitingForSecondOperand: false,
                history: [...state.history, calculation],
                expression: String(result)
            };
        }
        return state;
    }

    case 'CLEAR_ALL':
      return { ...initialState, memory: state.memory, history: state.history };

    case 'CLEAR_ENTRY':
      return { ...state, displayValue: '0', isError: false, expression: state.operator ? state.expression.slice(0, -1) : '' };

    case 'BACKSPACE':
        if (state.isError || (state.displayValue.length === 1 && state.displayValue !== '0')) {
            return { ...state, displayValue: '0', isError: false, expression: '' };
        }
        if (state.displayValue !== '0') {
            const newDisplayValue = state.displayValue.slice(0, -1) || '0';
            const newExpression = state.operator ? state.expression.slice(0, -1) : newDisplayValue;
            return { ...state, displayValue: newDisplayValue, expression: newExpression };
        }
        return state;
      
    case 'TOGGLE_SIGN':
        if (state.displayValue === '0' || state.isError) {
            return state;
        }
        const toggledValue = String(parseFloat(state.displayValue) * -1);
        const toggledExpression = state.operator ? state.expression.slice(0, -state.displayValue.length) + toggledValue : toggledValue;
        return { ...state, displayValue: toggledValue, expression: toggledExpression };

    case 'APPLY_PERCENTAGE':
        if (state.isError) {
            return state;
        }
        const percentageValue = String(parseFloat(state.displayValue) / 100);
        const percentageExpression = state.operator ? state.expression.slice(0, -state.displayValue.length) + percentageValue : percentageValue;
        return { ...state, displayValue: percentageValue, expression: percentageExpression };

    case 'SQUARE':
        if (state.isError) {
            return state;
        }
        const squareValue = parseFloat(state.displayValue);
        const squareResult = scientificCalculate(squareValue, 'square');
        return { ...state, displayValue: String(squareResult), expression: String(squareResult) };

    case 'SQUARE_ROOT':
        if (state.isError) {
            return state;
        }
        const sqrtValue = parseFloat(state.displayValue);
        if (sqrtValue < 0) {
            return { ...state, displayValue: 'Error', isError: true, expression: '' };
        }
        const sqrtResult = scientificCalculate(sqrtValue, 'sqrt');
        return { ...state, displayValue: String(sqrtResult), expression: String(sqrtResult) };

    case 'RECIPROCAL':
        if (state.isError) {
            return state;
        }
        const reciprocalValue = parseFloat(state.displayValue);
        if (reciprocalValue === 0) {
            return { ...state, displayValue: 'Error', isError: true, expression: '' };
        }
        const reciprocalResult = scientificCalculate(reciprocalValue, 'reciprocal');
        return { ...state, displayValue: String(reciprocalResult), expression: String(reciprocalResult) };

    case 'MEMORY_STORE':
        if (state.isError) {
            return state;
        }
        return { ...state, memory: parseFloat(state.displayValue) };

    case 'MEMORY_RECALL':
        return { ...state, displayValue: String(state.memory), expression: String(state.memory) };

    case 'MEMORY_ADD':
        if (state.isError) {
            return state;
        }
        return { ...state, memory: state.memory + parseFloat(state.displayValue) };

    case 'MEMORY_SUBTRACT':
        if (state.isError) {
            return state;
        }
        return { ...state, memory: state.memory - parseFloat(state.displayValue) };

    case 'MEMORY_CLEAR':
        return { ...state, memory: 0 };

    case 'CLEAR_HISTORY':
        return { ...state, history: [] };

    default:
      return state;
  }
}

export function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [showHistory, setShowHistory] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

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
      } else if (['+', '-', '*', '/', '^'].includes(key)) {
        dispatch({ type: 'HANDLE_OPERATOR', payload: key });
      } else if (key === 'Enter' || key === '=') {
        dispatch({ type: 'CALCULATE' });
      } else if (key === 'Backspace') {
        dispatch({ type: 'BACKSPACE' });
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        dispatch({ type: 'CLEAR_ALL' });
      } else if (key === '%') {
        dispatch({ type: 'APPLY_PERCENTAGE' });
      } else if (key === 'h' || key === 'H') {
        setShowHistory(!showHistory);
      } else if (key === 'm' || key === 'M') {
        setShowMemory(!showMemory);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHistory, showMemory]);

  const numberButtons = [
    { value: '7', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '7' }) },
    { value: '8', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '8' }) },
    { value: '9', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '9' }) },
    { value: '4', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '4' }) },
    { value: '5', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '5' }) },
    { value: '6', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '6' }) },
    { value: '1', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '1' }) },
    { value: '2', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '2' }) },
    { value: '3', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '3' }) },
    { value: '0', handler: () => dispatch({ type: 'INPUT_DIGIT', payload: '0' }), className: 'col-span-2' },
    { value: '.', handler: () => dispatch({ type: 'INPUT_DECIMAL' }) },
  ];

  const operatorButtons = [
    { value: '+', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '+' }) },
    { value: '-', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '-' }) },
    { value: '×', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '*' }) },
    { value: '÷', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '/' }) },
    { value: '^', handler: () => dispatch({ type: 'HANDLE_OPERATOR', payload: '^' }) },
  ];

  const functionButtons = [
    { value: 'C', handler: () => dispatch({ type: 'CLEAR_ALL' }), variant: 'destructive' },
    { value: 'CE', handler: () => dispatch({ type: 'CLEAR_ENTRY' }), variant: 'outline' },
    { value: '←', handler: () => dispatch({ type: 'BACKSPACE' }), variant: 'outline' },
    { value: '±', handler: () => dispatch({ type: 'TOGGLE_SIGN' }), variant: 'outline' },
    { value: '%', handler: () => dispatch({ type: 'APPLY_PERCENTAGE' }), variant: 'outline' },
    { value: 'x²', handler: () => dispatch({ type: 'SQUARE' }), variant: 'outline' },
    { value: '√', handler: () => dispatch({ type: 'SQUARE_ROOT' }), variant: 'outline' },
    { value: '1/x', handler: () => dispatch({ type: 'RECIPROCAL' }), variant: 'outline' },
  ];

  const memoryButtons = [
    { value: 'MS', handler: () => dispatch({ type: 'MEMORY_STORE' }), variant: 'outline' },
    { value: 'MR', handler: () => dispatch({ type: 'MEMORY_RECALL' }), variant: 'outline' },
    { value: 'M+', handler: () => dispatch({ type: 'MEMORY_ADD' }), variant: 'outline' },
    { value: 'M-', handler: () => dispatch({ type: 'MEMORY_SUBTRACT' }), variant: 'outline' },
    { value: 'MC', handler: () => dispatch({ type: 'MEMORY_CLEAR' }), variant: 'outline' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Calculator
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="h-8 w-8 p-0"
              title="History (H)"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMemory(!showMemory)}
              className="h-8 w-8 p-0"
              title="Memory (M)"
            >
              <MemoryStick className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="space-y-2">
          {/* Expression Display */}
          {state.expression && state.expression !== state.displayValue && (
            <div className="text-right text-sm text-muted-foreground font-mono h-6 flex items-center justify-end">
              {state.expression}
            </div>
          )}
          
          {/* Result Display */}
          <Input
            readOnly
            value={state.displayValue}
            className={`text-right text-3xl font-mono h-16 transition-colors ${
              state.isError ? 'text-red-500 bg-red-50' : ''
            }`}
          />
          {state.memory !== 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MemoryStick className="h-4 w-4" />
              <span>Memory: {state.memory}</span>
            </div>
          )}
        </div>

        {/* Memory Panel */}
        {showMemory && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Memory Functions</span>
              <Badge variant="secondary">{state.memory}</Badge>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {memoryButtons.map(({ value, handler, variant }) => (
                <Button
                  key={value}
                  onClick={handler}
                  variant={variant as any}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="p-3 bg-muted rounded-lg max-h-32">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">History</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="h-24">
              {state.history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No calculations yet</p>
              ) : (
                <div className="space-y-1">
                  {state.history.slice().reverse().map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground font-mono">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Function Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {functionButtons.map(({ value, handler, variant }) => (
            <Button
              key={value}
              onClick={handler}
              variant={variant as any}
              size="sm"
              className="h-10"
            >
              {value}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Calculator Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Number Pad */}
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {numberButtons.map(({ value, handler, className }) => (
              <Button
                key={value}
                onClick={handler}
                variant="outline"
                className={className || ''}
              >
                {value}
              </Button>
            ))}
          </div>

          {/* Operators */}
          <div className="grid grid-cols-1 gap-2">
            {operatorButtons.map(({ value, handler }) => (
              <Button
                key={value}
                onClick={handler}
                variant="outline"
                className="h-10"
              >
                {value}
              </Button>
            ))}
            <Button
              onClick={() => dispatch({ type: 'CALCULATE' })}
              className="h-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              =
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Keyboard shortcuts: H (History), M (Memory), Esc (Clear)</p>
        </div>
      </CardContent>
    </Card>
  );
} 