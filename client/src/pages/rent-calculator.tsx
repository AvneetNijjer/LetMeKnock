import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Wallet, DollarSign, LineChart, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function RentCalculatorPage() {
  const [income, setIncome] = useState<number>(2000);
  const [otherExpenses, setOtherExpenses] = useState<number>(500);
  const [rentAmount, setRentAmount] = useState<number>(800);
  const [utilities, setUtilities] = useState<number>(150);
  const [includeUtilities, setIncludeUtilities] = useState<boolean>(true);
  const [savingsGoal, setSavingsGoal] = useState<number>(300);
  const [roommates, setRoommates] = useState<number>(1);
  
  const [activeTab, setActiveTab] = useState<string>('calculator');
  
  const handleIncomeChange = (value: number[]) => {
    setIncome(value[0]);
  };
  
  const handleOtherExpensesChange = (value: number[]) => {
    setOtherExpenses(value[0]);
  };
  
  const handleRentChange = (value: number[]) => {
    setRentAmount(value[0]);
  };
  
  const handleUtilitiesChange = (value: number[]) => {
    setUtilities(value[0]);
  };
  
  const handleSavingsGoalChange = (value: number[]) => {
    setSavingsGoal(value[0]);
  };
  
  const handleRoommatesChange = (value: string) => {
    setRoommates(parseInt(value));
  };
  
  // Calculate total housing cost
  const totalHousingCost = includeUtilities 
    ? rentAmount + utilities 
    : rentAmount;
  
  // Calculate individual rent (split by roommates)
  const individualRent = Math.round(totalHousingCost / roommates);
  
  // Calculate remaining money after rent and other expenses
  const remainingMoney = income - individualRent - otherExpenses;
  
  // Calculate if the rent is affordable based on 30% rule
  const thirtyPercentOfIncome = income * 0.3;
  const isAffordable = individualRent <= thirtyPercentOfIncome;
  
  // Calculate affordability metrics
  const rentToIncomeRatio = Math.round((individualRent / income) * 100);
  const savingsAfterExpenses = remainingMoney - savingsGoal;
  const canMeetSavingsGoal = savingsAfterExpenses >= 0;
  
  // Max affordable rent based on 30% rule
  const maxAffordableRent = Math.round(income * 0.3);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Student Rent Calculator</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Plan your budget and determine what rent you can afford as a student.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="tips">Tips & Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-primary" /> 
                      Budget Information
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Enter your financial details to calculate your affordability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex justify-between">
                        <Label>Monthly Income</Label>
                        <span className="font-medium">${income}</span>
                      </div>
                      <Slider
                        min={500}
                        max={5000}
                        step={50}
                        value={[income]}
                        onValueChange={handleIncomeChange}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$500</span>
                        <span>$5,000</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex justify-between">
                        <Label>Other Monthly Expenses</Label>
                        <span className="font-medium">${otherExpenses}</span>
                      </div>
                      <Slider
                        min={0}
                        max={2000}
                        step={50}
                        value={[otherExpenses]}
                        onValueChange={handleOtherExpensesChange}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$2,000</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex justify-between">
                        <Label>Monthly Rent</Label>
                        <span className="font-medium">${rentAmount}</span>
                      </div>
                      <Slider
                        min={400}
                        max={3000}
                        step={50}
                        value={[rentAmount]}
                        onValueChange={handleRentChange}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$400</span>
                        <span>$3,000</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                      <Switch
                        id="utilities-toggle"
                        checked={includeUtilities}
                        onCheckedChange={setIncludeUtilities}
                      />
                      <Label htmlFor="utilities-toggle">Include utilities in calculation</Label>
                    </motion.div>
                    
                    {includeUtilities && (
                      <motion.div 
                        className="space-y-2" 
                        variants={itemVariants}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between">
                          <Label>Monthly Utilities</Label>
                          <span className="font-medium">${utilities}</span>
                        </div>
                        <Slider
                          min={0}
                          max={500}
                          step={10}
                          value={[utilities]}
                          onValueChange={handleUtilitiesChange}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$0</span>
                          <span>$500</span>
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex justify-between">
                        <Label>Monthly Savings Goal</Label>
                        <span className="font-medium">${savingsGoal}</span>
                      </div>
                      <Slider
                        min={0}
                        max={1000}
                        step={50}
                        value={[savingsGoal]}
                        onValueChange={handleSavingsGoalChange}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$1,000</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label>Number of Roommates</Label>
                      <Select value={roommates.toString()} onValueChange={handleRoommatesChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select roommates" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Just me (1)</SelectItem>
                          <SelectItem value="2">Me + 1 roommate (2)</SelectItem>
                          <SelectItem value="3">Me + 2 roommates (3)</SelectItem>
                          <SelectItem value="4">Me + 3 roommates (4)</SelectItem>
                          <SelectItem value="5">Me + 4 roommates (5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        This will split the total housing cost evenly
                      </p>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-primary" /> 
                      Tips & Resources
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Helpful advice for student budgeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">The 30% Rule</h3>
                      <p className="text-sm text-muted-foreground">
                        A common budgeting guideline is to spend no more than 30% of your monthly income on rent. 
                        For students with limited income, try to keep it even lower if possible.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Don't Forget Hidden Costs</h3>
                      <p className="text-sm text-muted-foreground">
                        When budgeting for housing, remember to include utilities, internet, renter's insurance, 
                        and potentially parking or public transit costs in your calculations.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Consider Location Carefully</h3>
                      <p className="text-sm text-muted-foreground">
                        A cheaper apartment far from campus might seem like a good deal, but if you need to spend 
                        more on transportation or time commuting, it might not be worth it.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Emergency Fund</h3>
                      <p className="text-sm text-muted-foreground">
                        Try to build an emergency fund that covers at least 3 months of expenses. 
                        Start with a goal of saving just $500 and build from there.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Student Financial Aid Resources</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Check with your school's financial aid office for emergency grants</li>
                        <li>Look into work-study programs on campus</li>
                        <li>Research scholarships specifically for housing costs</li>
                        <li>Consider becoming a Resident Assistant (RA) for free or reduced housing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" /> 
                  Your Affordability Analysis
                </div>
              </CardTitle>
              <CardDescription>
                Based on your input, here's your personalized rent affordability assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Your Portion of Rent + Utilities</h3>
                    <span className={`font-bold text-lg ${!isAffordable ? 'text-red-500' : 'text-green-600'}`}>
                      ${individualRent}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {roommates > 1 ? (
                      <p>Total housing cost of ${totalHousingCost} split {roommates} ways</p>
                    ) : (
                      <p>Total housing cost: ${totalHousingCost}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Income: ${income}</span>
                      <span>Recommended max: ${maxAffordableRent}</span>
                    </div>
                    <Progress
                      value={(individualRent / income) * 100}
                      className="h-2"
                      indicatorClassName={isAffordable ? 'bg-green-500' : 'bg-red-500'}
                    />
                    <div className="flex justify-between text-xs">
                      <span>0%</span>
                      <span className={`${rentToIncomeRatio > 30 ? 'text-red-500 font-medium' : ''}`}>
                        You're spending {rentToIncomeRatio}% of income on housing
                      </span>
                      <span>50%</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Remaining after Housing & Expenses</h3>
                    <span className={`font-bold text-lg ${remainingMoney < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ${remainingMoney}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    <p>After paying rent and all other expenses</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Monthly savings goal: ${savingsGoal}</span>
                      <span>{canMeetSavingsGoal ? 'On track' : 'Shortfall'}: ${Math.abs(savingsAfterExpenses)}</span>
                    </div>
                    <Progress
                      value={canMeetSavingsGoal ? 100 : (remainingMoney / savingsGoal) * 100}
                      className="h-2"
                      indicatorClassName={canMeetSavingsGoal ? 'bg-green-500' : 'bg-amber-500'}
                    />
                    <div className="flex justify-between text-xs">
                      <span>$0</span>
                      <span>Your savings goal: ${savingsGoal}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              <div className="border rounded-lg p-5">
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="flex items-start gap-4">
                    {isAffordable ? (
                      <>
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-600">Affordable Rent</h3>
                          <p className="text-sm text-muted-foreground">
                            This rent is within the recommended 30% of your income.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-red-600">Rent Exceeds Recommendation</h3>
                          <p className="text-sm text-muted-foreground">
                            This rent is more than the recommended 30% of your income. Consider finding roommates or a more affordable place.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="font-medium">Budget Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Housing ({rentToIncomeRatio}%)</span>
                        <span className="font-medium">${individualRent}</span>
                        <div className="h-2 w-full bg-blue-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${Math.min(rentToIncomeRatio * 3, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 p-3 bg-purple-50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Other Expenses ({Math.round((otherExpenses / income) * 100)}%)</span>
                        <span className="font-medium">${otherExpenses}</span>
                        <div className="h-2 w-full bg-purple-200 rounded-full">
                          <div 
                            className="h-2 bg-purple-500 rounded-full" 
                            style={{ width: `${Math.min((otherExpenses / income) * 100 * 3, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 p-3 bg-green-50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Remaining ({Math.round((remainingMoney / income) * 100)}%)</span>
                        <span className={`font-medium ${remainingMoney < 0 ? 'text-red-500' : ''}`}>
                          ${remainingMoney}
                        </span>
                        <div className="h-2 w-full bg-green-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${remainingMoney < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(Math.max((remainingMoney / income) * 100 * 3, 0), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-2 mt-6">
                    <h3 className="font-medium">Our Recommendation</h3>
                    {remainingMoney < 0 ? (
                      <p className="text-red-600 text-sm">
                        Your budget is in the negative. Consider reducing your rent, finding more roommates, or 
                        increasing your income to achieve a balanced budget.
                      </p>
                    ) : !canMeetSavingsGoal ? (
                      <p className="text-amber-600 text-sm">
                        Your rent is affordable, but you won't be able to meet your savings goal. Consider 
                        reducing expenses or adjusting your savings target.
                      </p>
                    ) : rentToIncomeRatio > 25 ? (
                      <p className="text-green-600 text-sm">
                        Your budget looks reasonable. Rent is within the recommended range, and you'll have enough 
                        left over for your savings goal.
                      </p>
                    ) : (
                      <p className="text-green-600 text-sm">
                        Great job! Your rent is well within your budget. You'll have enough left over for savings 
                        and other financial goals.
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setActiveTab('tips')}>
                  View Budgeting Tips
                </Button>
                <Button onClick={() => window.print()}>
                  Save Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}