import Plan from "../models/Plan.js";

// Create Plan
export const createPlan = async (req, res) => {
  try {
    const {  name, description, amount , type,days } = req.body;

    const exists = await Plan.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "name  already exists" });
    }

    const plan = new Plan({  name, description, amount , type,days });
    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Plan by planId
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.planId });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Plan
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.planId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Plan
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.planId });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
