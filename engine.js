(function(root){
  const RULES = [
    {key:'refund', category:'Refund', priority:'High', terms:['refund','money back','reimbursement','where is my money'], review:true},
    {key:'cancel', category:'Cancellation', priority:'High', terms:['cancel my order','cancel order','cancellation'], review:true},
    {key:'address', category:'Order change', priority:'High', terms:['change the address','change delivery address','wrong address','update my address'], review:true},
    {key:'complaint', category:'Complaint', priority:'High', terms:['third time','nobody has replied','no one replied','complaint','angry','unacceptable','never again'], review:true},
    {key:'damaged', category:'Damaged item', priority:'High', terms:['broken','damaged','arrived broken','defective'], review:true},
    {key:'delivery', category:'Shipping / tracking', priority:'Medium', terms:['where is my order','tracking','when will it arrive','delivery','shipped','shipping','ship to'], review:false},
    {key:'return', category:'Returns', priority:'Medium', terms:['return','doesn\'t fit','does not fit','exchange'], review:false},
    {key:'product', category:'Product information', priority:'Low', terms:['is this','does this','product information','dishwasher safe','material','size chart'], review:false},
    {key:'discount', category:'Discount request', priority:'Medium', terms:['discount','promo code','coupon','20% off'], review:false}
  ];
  function classify(message) {
    const m=String(message||'').toLowerCase();
    for (const r of RULES) if (r.terms.some(t=>m.includes(t))) return {category:r.category, priority:r.priority, humanReview:r.review, reason:r.review?'Sensitive action or service failure; human review required.':'Routine topic; verify the store policy before use.'};
    return {category:'Other / uncertain', priority:'Medium', humanReview:true, reason:'No confident rule match. Human review required.'};
  }
  function draft(message, policy, c) {
    const p=String(policy||'').trim();
    const x=c||classify(message);
    if (x.category==='Refund') return 'I’m sorry you’re waiting for your refund. We need to check the return and refund status against the store’s policy before confirming the next steps or timing.';
    if (x.category==='Cancellation') return 'I can help route this request, but cancellation depends on the order’s current status. The support team needs to verify the order and check whether it can still be cancelled.';
    if (x.category==='Order change') return 'We can check whether the requested change is still possible, but this depends on the order status. The support team must verify the order through the store’s approved process.';
    if (x.category==='Complaint') return 'I’m sorry you’ve had to contact us multiple times without a response. This needs review by the support team. Please use the store’s approved support channel so the team can check the previous messages.';
    if (x.category==='Damaged item') return 'I’m sorry the item arrived damaged. The support team needs to review the order and the store’s damaged-item policy before confirming the available next steps.';
    if (x.category==='Shipping / tracking') return p ? 'Thanks for reaching out. Based on the store policy provided, we can explain the shipping process, but we cannot confirm the live status or delivery date from this message alone. Please check the order confirmation or the store’s approved tracking channel.' : 'Thanks for reaching out. We need the store’s current shipping policy and approved tracking process before we can give accurate guidance.';
    if (x.category==='Returns') return p ? 'You may be eligible for a return subject to the store policy provided. Before confirming eligibility, the support team should verify the delivery date, item condition, and any exclusions that apply.' : 'I can help clarify the return process, but we need the store’s current return policy before confirming eligibility.';
    if (x.category==='Product information') return p ? 'I’d be happy to help check that. We should confirm the product-specific details in the store’s approved product information before giving a definitive answer.' : 'I’d be happy to help check that. We need the product-specific details before giving a definitive answer.';
    if (x.category==='Discount request') return 'Thanks for being interested in our store. We can only confirm discounts that are listed in the current promotion terms or approved by the store team.';
    return 'Thanks for contacting us. We need a team member to review your message against the store’s current policy before giving a reliable answer.';
  }
  function analyze(item) {
    const c=classify(item.message);
    const response=draft(item.message,item.policy,c);
    const unsupportedPromises=/(i have (cancelled|refunded|escalated|updated)|your refund (has been|will be)|your order is cancelled|i've (cancelled|refunded|escalated)|i am escalating this now)/i.test(response);
    return {...item,...c,response,unsupportedPromises,reviewStatus:'Needs human review'};
  }
  const api={classify,draft,analyze};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  if (root) root.CaseOpsEngine=api;
})(typeof window!=='undefined'?window:globalThis);
