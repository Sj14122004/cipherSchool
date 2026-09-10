import "dotenv/config";
import prisma from "../src/lib/prisma.js";

const problems = [
  {
    title: "Parking Lot",

    description:
      "Design a parking lot system that can park and remove vehicles while handling capacity and duplicate vehicles.",

    difficulty: "EASY",
    category: "LLD",

    requirements: `
- Create a parking lot with a fixed capacity.
- Park a vehicle.
- Remove a vehicle.
- Prevent duplicate vehicles.
- Handle a full parking lot.
- Handle removing a vehicle that does not exist.
`,

    constraints:
      "The parking lot has a fixed capacity and each vehicle can occupy only one parking spot.",

    expectedBehavior:
      "The system should correctly manage parking state and return meaningful results for valid and invalid operations.",

    starterCode: `
class ParkingLot {

    public String execute(String command) {
        // Implement your solution
        return "";
    }
}
`,

    executionContract: {
      className: "ParkingLot",
      methodName: "execute",
      parameterType: "String",
      returnType: "String",

      commandFormat: {
        syntax: [
          "CREATE:<capacity>",
          "PARK:<vehicle-id>",
          "REMOVE:<vehicle-id>",
        ],

        examples: [
          "CREATE:2",
          "PARK:CAR1",
          "PARK:CAR2",
          "REMOVE:CAR1",
        ],
      },
    },

    testCases: [
      {
        id: "parking-basic",
        name: "Basic parking",
        commands: [
          "CREATE:2",
          "PARK:CAR1",
          "PARK:CAR2",
        ],
        expectedOutput: [
          "CREATED",
          "PARKED",
          "PARKED",
        ],
      },

      {
        id: "parking-full",
        name: "Parking lot full",
        commands: [
          "CREATE:2",
          "PARK:CAR1",
          "PARK:CAR2",
          "PARK:CAR3",
        ],
        expectedOutput: [
          "CREATED",
          "PARKED",
          "PARKED",
          "FULL",
        ],
      },

      {
        id: "parking-duplicate",
        name: "Duplicate vehicle",
        commands: [
          "CREATE:2",
          "PARK:CAR1",
          "PARK:CAR1",
        ],
        expectedOutput: [
          "CREATED",
          "PARKED",
          "DUPLICATE",
        ],
      },

      {
        id: "parking-remove",
        name: "Remove vehicle",
        commands: [
          "CREATE:2",
          "PARK:CAR1",
          "REMOVE:CAR1",
        ],
        expectedOutput: [
          "CREATED",
          "PARKED",
          "REMOVED",
        ],
      },

      {
        id: "parking-not-found",
        name: "Vehicle not found",
        commands: [
          "CREATE:2",
          "REMOVE:CAR999",
        ],
        expectedOutput: [
          "CREATED",
          "NOT_FOUND",
        ],
      },
    ],

    evaluationRules: {
      requiredBehaviors: [
        "Create parking lot",
        "Park vehicle",
        "Remove vehicle",
        "Prevent duplicate vehicles",
        "Handle full parking lot",
      ],

      edgeCases: [
        "Duplicate vehicle",
        "Full parking lot",
        "Vehicle not found",
        "Invalid capacity",
      ],

      requiresState: true,

      minimumMeaningfulLines: 5,
      minimumMethodCount: 1,

      performance:
        "Parking and removal operations should ideally be close to O(1).",
    },

    estimatedTime: 30,
  },

  {
    title: "Elevator System",

    description:
      "Design an elevator system that accepts floor requests and handles invalid floor requests.",

    difficulty: "MEDIUM",
    category: "LLD",

    requirements: `
- Create an elevator with a maximum floor.
- Accept valid floor requests.
- Reject invalid floor requests.
- Handle requests for the current floor.
- Support multiple requests.
`,

    constraints:
      "Floor numbers must be within the configured elevator range.",

    expectedBehavior:
      "The system should accept valid requests and reject invalid requests.",

    starterCode: `
class Elevator {

    public String execute(String command) {
        // Implement your solution
        return "";
    }
}
`,

    executionContract: {
      className: "Elevator",
      methodName: "execute",
      parameterType: "String",
      returnType: "String",

      commandFormat: {
        syntax: [
          "CREATE:<maximum-floor>",
          "REQUEST:<floor>",
          "POSITION:<floor>",
        ],

        examples: [
          "CREATE:10",
          "REQUEST:5",
          "POSITION:5",
        ],
      },
    },

    testCases: [
      {
        id: "elevator-basic",
        name: "Basic request",
        commands: [
          "CREATE:10",
          "REQUEST:5",
        ],
        expectedOutput: [
          "CREATED",
          "REQUEST_ACCEPTED",
        ],
      },

      {
        id: "elevator-invalid-floor",
        name: "Invalid floor",
        commands: [
          "CREATE:10",
          "REQUEST:0",
        ],
        expectedOutput: [
          "CREATED",
          "INVALID_FLOOR",
        ],
      },

      {
        id: "elevator-max-floor",
        name: "Maximum floor exceeded",
        commands: [
          "CREATE:10",
          "REQUEST:11",
        ],
        expectedOutput: [
          "CREATED",
          "INVALID_FLOOR",
        ],
      },

      {
        id: "elevator-current-floor",
        name: "Current floor request",
        commands: [
          "CREATE:10",
          "POSITION:5",
          "REQUEST:5",
        ],
        expectedOutput: [
          "CREATED",
          "POSITION_SET",
          "ARRIVED",
        ],
      },

      {
        id: "elevator-multiple-requests",
        name: "Multiple requests",
        commands: [
          "CREATE:10",
          "REQUEST:3",
          "REQUEST:7",
        ],
        expectedOutput: [
          "CREATED",
          "REQUEST_ACCEPTED",
          "REQUEST_ACCEPTED",
        ],
      },
    ],

    evaluationRules: {
      requiredBehaviors: [
        "Create elevator",
        "Accept valid floor request",
        "Reject invalid floor",
        "Handle current floor",
        "Manage multiple requests",
      ],

      edgeCases: [
        "Invalid floor",
        "Maximum floor",
        "Current floor",
        "Multiple requests",
      ],

      requiresState: true,

      minimumMeaningfulLines: 5,
      minimumMethodCount: 1,

      performance:
        "Floor request processing should avoid unnecessary repeated scanning where possible.",
    },

    estimatedTime: 40,
  },

  {
    title: "Vending Machine",

    description:
      "Design a vending machine that manages products, inventory, payments, and dispensing.",

    difficulty: "MEDIUM",
    category: "LLD",

    requirements: `
- Add products to inventory.
- Select a product.
- Accept payment.
- Dispense the selected product.
- Handle insufficient payment.
- Handle unavailable products.
- Handle invalid product selection.
`,

    constraints:
      "A product can only be dispensed when it exists, is in stock, and sufficient payment has been provided.",

    expectedBehavior:
      "The vending machine should correctly manage inventory and payment state.",

    starterCode: `
class VendingMachine {

    public String execute(String command) {
        // Implement your solution
        return "";
    }
}
`,

    executionContract: {
      className: "VendingMachine",
      methodName: "execute",
      parameterType: "String",
      returnType: "String",

      commandFormat: {
        syntax: [
          "ADD:<product-id>:<quantity>:<price>",
          "SELECT:<product-id>",
          "PAY:<amount>",
          "DISPENSE",
        ],

        examples: [
          "ADD:A1:10:20",
          "SELECT:A1",
          "PAY:20",
          "DISPENSE",
        ],
      },
    },

    testCases: [
      {
        id: "vending-basic",
        name: "Basic purchase",
        commands: [
          "ADD:A1:10:20",
          "SELECT:A1",
          "PAY:20",
          "DISPENSE",
        ],
        expectedOutput: [
          "ADDED",
          "SELECTED",
          "PAYMENT_ACCEPTED",
          "DISPENSED",
        ],
      },

      {
        id: "vending-out-of-stock",
        name: "Out of stock",
        commands: [
          "ADD:A1:0:20",
          "SELECT:A1",
        ],
        expectedOutput: [
          "ADDED",
          "OUT_OF_STOCK",
        ],
      },

      {
        id: "vending-insufficient-payment",
        name: "Insufficient payment",
        commands: [
          "ADD:A1:10:20",
          "SELECT:A1",
          "PAY:10",
          "DISPENSE",
        ],
        expectedOutput: [
          "ADDED",
          "SELECTED",
          "PAYMENT_ACCEPTED",
          "INSUFFICIENT_PAYMENT",
        ],
      },

      {
        id: "vending-invalid-product",
        name: "Invalid product",
        commands: [
          "SELECT:INVALID",
        ],
        expectedOutput: [
          "INVALID_PRODUCT",
        ],
      },

      {
        id: "vending-inventory",
        name: "Inventory decreases",
        commands: [
          "ADD:A1:2:20",
          "SELECT:A1",
          "PAY:20",
          "DISPENSE",
          "SELECT:A1",
          "PAY:20",
          "DISPENSE",
          "SELECT:A1",
        ],
        expectedOutput: [
          "ADDED",
          "SELECTED",
          "PAYMENT_ACCEPTED",
          "DISPENSED",
          "SELECTED",
          "PAYMENT_ACCEPTED",
          "DISPENSED",
          "OUT_OF_STOCK",
        ],
      },
    ],

    evaluationRules: {
      requiredBehaviors: [
        "Manage inventory",
        "Select product",
        "Accept payment",
        "Dispense product",
        "Handle insufficient payment",
        "Handle unavailable product",
      ],

      edgeCases: [
        "Invalid product",
        "Out of stock",
        "Insufficient payment",
        "Repeated purchase",
      ],

      requiresState: true,

      minimumMeaningfulLines: 5,
      minimumMethodCount: 1,

      performance:
        "Product lookup should ideally be efficient using an appropriate data structure.",
    },

    estimatedTime: 40,
  },
];

const seed = async () => {
  console.log("Cleaning database...");

  // Delete dependent records first
  await prisma.evaluation.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating test user...");

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: "test123",
    },
  });

  console.log(`Created user with ID: ${user.id}`);

  console.log("Creating problems...");

  for (const problem of problems) {
    const createdProblem = await prisma.problem.create({
      data: problem,
    });

    console.log(
      `Created problem: ${createdProblem.title} (ID: ${createdProblem.id})`
    );
  }

  console.log("");
  console.log("Seed completed successfully.");
  console.log(`Created ${problems.length} problems.`);
};

seed()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });