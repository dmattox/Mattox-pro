package pro.mattox;

import java.io.Serializable;

public class AdditionalIncomeSourceBean implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -608477874075736406L;
	private String sourceName = "Income Source";
	private double yearlyAmount = 10000.0; 
	private Boolean inflationAdjusted = true;
	private double effectiveAge = 55.0;
	
	public AdditionalIncomeSourceBean() {
		
	}
	
	public AdditionalIncomeSourceBean(String name, double yearly, Boolean inflationAdjusted, double effectiveAge) {
		set(name, yearly, inflationAdjusted, effectiveAge);
	}
	
	private void set(String name, double yearly, Boolean inflationAdjusted, double effectiveAge) {
		setSourceName(name);
		setYearlyAmount(yearly);
		setInflationAdjusted(inflationAdjusted);
		setEffectiveAge(effectiveAge);
	}

	public String getSourceName() {
		return sourceName;
	}
	public void setSourceName(String sourceName) {
		this.sourceName = sourceName;
	}
	public double getYearlyAmount() {
		return yearlyAmount;
	}
	public void setYearlyAmount(double yearlyAmount) {
		this.yearlyAmount = yearlyAmount;
	}
	public Boolean getInflationAdjusted() {
		return inflationAdjusted;
	}
	public void setInflationAdjusted(Boolean inflationAdjusted) {
		this.inflationAdjusted = inflationAdjusted;
	}
	public double getEffectiveAge() {
		return effectiveAge;
	}
	public void setEffectiveAge(double effectiveAge) {
		this.effectiveAge = effectiveAge;
	}
}
