import {VictoryBar, VictoryChart, VictoryContainer, VictoryLabel, VictoryPolarAxis, VictoryTheme} from "victory";

type Brand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}

export function BrandsPolarAxis(props: { data: { brand: Brand; orderTotal: number; budgetTotal: number; reorderTotal: number; reorderBudgetTotal: number }[] }) {
    return (
        <div>
            <VictoryChart polar
                      theme={VictoryTheme.material}
                      width={350}
                      height={350}
                          containerComponent={<VictoryContainer responsive={false}/>}
        >
            {
                props.data.map((d, i) => {
                    return (
                        <VictoryPolarAxis dependentAxis
                                          width={400}
                                          height={400}
                                          key={i}
                                          label={d.brand.name}
                                          labelPlacement="perpendicular"
                                          style={{
                                              tickLabels: { fill: "none"},
                                              axisLabel:{padding:25,fontSize:15}
                        }}
                                          domain={[0,1]}
                                          axisValue={d.brand.name}
                                          padding={25}
                        />
                    );
                })
            }

            <VictoryBar
                width={400}
                height={400}
                style={{ data: { fill: "tomato", width: 25 } }}
                data={props.data.map((d)=> {
                    let reachedBudget = d.orderTotal/(d.budgetTotal+0.01);
                    if(reachedBudget>1){
                        reachedBudget=1;
                    } else {
                        reachedBudget=reachedBudget;
                    }
                    return {x:d.brand.name,y:reachedBudget};
                })}
                labels={({ datum }) => {
                    if(datum.y>0.01)
                    return (datum.y*100).toFixed(0)+"%"
                    else return ""
                }
            }

            />
        </VictoryChart>
        </div>
    );
}