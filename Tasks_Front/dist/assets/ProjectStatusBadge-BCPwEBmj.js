import{h as s,j as c}from"./index-CLnmuTsT.js";import{B as o}from"./badge-DIlLlDgn.js";/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M5 3v14",key:"9nsxs2"}],["path",{d:"M12 3v8",key:"1h2ygw"}],["path",{d:"M19 3v18",key:"1sk56x"}]],g=s("kanban",d),h=({status:t})=>{const r=e=>{switch(e){case"pending":return"secondary";case"in_progress":return"default";case"done":return"default";case"rated":return"outline";default:return"secondary"}},n=e=>{switch(e){case"pending":return"text-chart-1";case"in_progress":return"text-chart-2";case"done":return"text-chart-3";case"rated":return"text-chart-4";default:return"text-muted-foreground"}},a=e=>{switch(e){case"pending":return"Pending";case"in_progress":return"In Progress";case"done":return"Done";case"rated":return"Rated";default:return e}};return c.jsx(o,{variant:r(t),className:n(t),children:a(t)})};export{g as K,h as P};
